import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import { Coupon, CouponUsage } from "../models/couponModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Helper function để rollback stock
const rollbackStock = async (stockUpdates) => {
  try {
    for (const update of stockUpdates) {
      await productModel.findByIdAndUpdate(update.productId, {
        stock: update.oldStock
      });
    }
  } catch (rollbackError) {
    console.error("Stock rollback error:", rollbackError);
  }
};

// Helper function để xác minh coupon
const validateCouponForOrder = async (coupon, userId, originalAmount) => {
  if (!coupon || !coupon._id) {
    return { isValid: false, validatedCoupon: null, discountAmount: 0 };
  }

  try {
    // Tìm và xác minh coupon
    const foundCoupon = await Coupon.findById(coupon._id);
    
    if (!foundCoupon || !foundCoupon.isActive) {
      throw new Error("Mã giảm giá không hợp lệ hoặc đã hết hạn");
    }

    // Kiểm tra thời hạn
    const now = new Date();
    if (now < foundCoupon.startDate || now > foundCoupon.expiryDate) {
      throw new Error("Mã giảm giá đã hết hạn");
    }

    // Kiểm tra giá trị đơn hàng tối thiểu
    if (originalAmount < foundCoupon.minOrderValue) {
      throw new Error(`Đơn hàng phải từ ${foundCoupon.minOrderValue.toLocaleString('vi-VN')}đ trở lên`);
    }

    // Kiểm tra số lần sử dụng tối đa
    if (foundCoupon.maxUses && foundCoupon.currentUses >= foundCoupon.maxUses) {
      throw new Error("Mã giảm giá đã hết lượt sử dụng");
    }

    // Kiểm tra số lần sử dụng của user
    const userUsageCount = await CouponUsage.countDocuments({
      userId: userId,
      couponId: foundCoupon._id
    });

    if (userUsageCount >= foundCoupon.maxUsesPerUser) {
      throw new Error("Bạn đã sử dụng hết lượt cho mã giảm giá này");
    }

    // Tính toán giảm giá
    let discountAmount = 0;
    if (foundCoupon.discountType === "fixed") {
      discountAmount = Math.min(foundCoupon.discountValue, originalAmount);
    } else if (foundCoupon.discountType === "percentage") {
      discountAmount = (originalAmount * foundCoupon.discountValue) / 100;
      if (foundCoupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, foundCoupon.maxDiscount);
      }
    }

    discountAmount = Math.min(discountAmount, originalAmount);

    return {
      isValid: true,
      validatedCoupon: foundCoupon,
      discountAmount: Math.round(discountAmount)
    };

  } catch (error) {
    return {
      isValid: false,
      error: error.message,
      validatedCoupon: null,
      discountAmount: 0
    };
  }
};

// Helper function để xử lý coupon usage
const handleCouponUsage = async (coupon, userId, orderId, discountAmount) => {
  if (!coupon || discountAmount <= 0) return;

  try {
    // Lưu usage
    const couponUsage = new CouponUsage({
      userId: userId,
      couponId: coupon._id,
      orderId: orderId,
      discountAmount: discountAmount
    });
    await couponUsage.save();

    // Cập nhật currentUses
    await Coupon.findByIdAndUpdate(coupon._id, {
      $inc: { currentUses: 1 }
    });
  } catch (couponUsageError) {
    console.error("Coupon usage tracking error:", couponUsageError);
    // Không throw error vì đơn hàng đã được tạo thành công
  }
};

// Helper function để rollback coupon usage
const rollbackCouponUsage = async (orderId, couponId) => {
  if (!couponId) return;

  try {
    // Xóa usage record
    await CouponUsage.findOneAndDelete({
      orderId: orderId,
      couponId: couponId
    });
    
    // Giảm currentUses
    await Coupon.findByIdAndUpdate(couponId, {
      $inc: { currentUses: -1 }
    });
  } catch (error) {
    console.error("Coupon rollback error:", error);
  }
};

// Đặt hàng từ frontend (Updated với coupon support)
const placeOrder = async (req, res) => {
  const frontend_url = process.env.FRONTEND_URL || "http://localhost:3000";

  try {
    const { 
      items, 
      amount, 
      originalAmount,
      discountAmount = 0,
      coupon,
      address, 
      paymentMethod = "stripe",
      shippingFee = 0
    } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Dữ liệu sản phẩm không hợp lệ" 
      });
    }

    if (!["stripe", "cod"].includes(paymentMethod)) {
      return res.status(400).json({ 
        success: false, 
        message: "Phương thức thanh toán không hợp lệ" 
      });
    }

    if (
      !address ||
      !address.fullName ||
      !address.phoneNumber ||
      !address.area ||
      !address.city ||
      !address.state
    ) {
      return res.status(400).json({
        success: false,
        message: "Thông tin địa chỉ không đầy đủ",
      });
    }

    // 🎫 Xác minh coupon nếu có
    const totalBeforeDiscount = originalAmount || amount + discountAmount;
    const couponValidation = await validateCouponForOrder(coupon, req.user._id, totalBeforeDiscount);
    
    if (coupon && !couponValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: couponValidation.error || "Mã giảm giá không hợp lệ"
      });
    }

    const validatedCoupon = couponValidation.validatedCoupon;
    const validatedDiscountAmount = couponValidation.discountAmount;

    // 🔥 Kiểm tra tồn kho và trừ số lượng
    const stockUpdates = [];
    
    try {
      for (const item of items) {
        const product = await productModel.findById(item.productId);

        if (!product) {
          await rollbackStock(stockUpdates);
          return res.status(404).json({
            success: false,
            message: `Không tìm thấy sản phẩm với ID: ${item.productId}`,
          });
        }

        if (product.stock < item.quantity) {
          await rollbackStock(stockUpdates);
          return res.status(400).json({
            success: false,
            message: `Sản phẩm "${product.name}" không đủ số lượng. Chỉ còn ${product.stock} sản phẩm.`,
          });
        }

        // Lưu lại trạng thái stock cũ để rollback
        stockUpdates.push({
          productId: product._id,
          oldStock: product.stock,
          newStock: product.stock - item.quantity
        });

        // Trừ stock
        product.stock -= item.quantity;
        await product.save();
      }
    } catch (stockError) {
      console.error("Stock management error:", stockError);
      await rollbackStock(stockUpdates);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi xử lý tồn kho sản phẩm"
      });
    }

    // Tạo đơn hàng mới
    const finalAmount = totalBeforeDiscount - validatedDiscountAmount;
    const orderData = {
      userId: req.user._id,
      items,
      amount: Math.round(finalAmount),
      originalAmount: Math.round(totalBeforeDiscount),
      discountAmount: Math.round(validatedDiscountAmount),
      shippingFee: Math.round(shippingFee),
      coupon: validatedCoupon ? {
        couponId: validatedCoupon._id,
        code: validatedCoupon.code,
        discountAmount: Math.round(validatedDiscountAmount)
      } : null,
      address,
      status: "Đặt thành công",
      paymentMethod,
      payment: false, // Mặc định chưa thanh toán
      date: Date.now()
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    // Xử lý coupon usage sau khi tạo order thành công
    if (validatedCoupon && validatedDiscountAmount > 0) {
      await handleCouponUsage(validatedCoupon, req.user._id, newOrder._id, validatedDiscountAmount);
    }

    // Xóa giỏ hàng người dùng
    await userModel.findByIdAndUpdate(req.user._id, { cartData: {} });

    // Xử lý theo phương thức thanh toán
    if (paymentMethod === "cod") {
      return res.json({ 
        success: true, 
        message: "Đặt hàng thành công! Bạn sẽ thanh toán khi nhận hàng.",
        orderId: newOrder._id,
        paymentMethod: "cod",
        order: {
          _id: newOrder._id,
          totalAmount: newOrder.amount,
          originalAmount: newOrder.originalAmount,
          discountAmount: newOrder.discountAmount,
          coupon: newOrder.coupon
        }
      });
    } else {
      // Thanh toán Stripe
      try {
        const line_items = items.map((item) => {
          if (!item.price || !item.name) {
            throw new Error(`Dữ liệu sản phẩm không hợp lệ: ${JSON.stringify(item)}`);
          }

          const unit_amount = Math.round(item.price);
          if (isNaN(unit_amount) || unit_amount <= 0) {
            throw new Error(`Giá sản phẩm không hợp lệ: ${item.name}`);
          }

          return {
            price_data: {
              currency: "vnd",
              product_data: {
                name: item.name,
              },
              unit_amount,
            },
            quantity: item.quantity,
          };
        });

        // Thêm shipping fee nếu có
        if (shippingFee > 0) {
          line_items.push({
            price_data: {
              currency: "vnd",
              product_data: {
                name: "Phí vận chuyển",
              },
              unit_amount: Math.round(shippingFee),
            },
            quantity: 1,
          });
        }

        // Tạo session data
        const sessionData = {
          payment_method_types: ["card"],
          line_items,
          mode: "payment",
          success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
          cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
          metadata: {
            orderId: newOrder._id.toString(),
            userId: req.user._id.toString(),
            couponCode: validatedCoupon?.code || ""
          }
        };

        // Thêm discount vào Stripe session nếu có
        if (validatedDiscountAmount > 0) {
          try {
            const stripeCoupon = await stripe.coupons.create({
              amount_off: Math.round(validatedDiscountAmount),
              currency: 'vnd',
              duration: 'once',
              name: `Giảm giá ${validatedCoupon?.code || 'DISCOUNT'}`
            });

            sessionData.discounts = [{
              coupon: stripeCoupon.id
            }];
          } catch (couponError) {
            console.error("Error creating Stripe coupon:", couponError);
            // Tiếp tục mà không áp dụng discount trong Stripe
            // Discount đã được tính trong finalAmount
          }
        }

        const session = await stripe.checkout.sessions.create(sessionData);

        return res.json({ 
          success: true, 
          session_url: session.url,
          orderId: newOrder._id
        });

      } catch (stripeError) {
        console.error("Stripe session creation error:", stripeError.message, stripeError.stack);
        
        // Rollback nếu tạo Stripe session thất bại
        await orderModel.findByIdAndDelete(newOrder._id);
        await rollbackStock(stockUpdates);
        if (validatedCoupon) {
          await rollbackCouponUsage(newOrder._id, validatedCoupon._id);
        }
        
        return res.status(500).json({
          success: false,
          message: "Lỗi khi tạo phiên thanh toán"
        });
      }
    }

  } catch (error) {
    console.error("Error in placeOrder:", error);
    res.status(500).json({ 
      success: false, 
      message: "Lỗi hệ thống", 
      error: error.message 
    });
  }
};

// Xác minh đơn hàng (Updated)
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  
  try {
    if (success == "true") {
      const order = await orderModel.findByIdAndUpdate(orderId, { 
        payment: true,
        status: "Đặt thành công" // Cập nhật trạng thái khi thanh toán thành công
      });
      
      if (order && order.coupon) {
        console.log(`Order ${orderId} paid successfully with coupon ${order.coupon.code}`);
      }
      
      res.json({ success: true, message: "Thanh toán thành công" });
    } else {
      // Xử lý thanh toán thất bại
      const order = await orderModel.findById(orderId);
      
      if (order) {
        // Hoàn lại stock cho các sản phẩm
        for (const item of order.items) {
          await productModel.findByIdAndUpdate(item.productId, {
            $inc: { stock: item.quantity }
          });
        }

        // Rollback coupon usage nếu có
        if (order.coupon) {
          await rollbackCouponUsage(orderId, order.coupon.couponId);
        }

        // Xóa đơn hàng nếu thanh toán Stripe thất bại
        if (order.paymentMethod === "stripe") {
          await orderModel.findByIdAndDelete(orderId);
        } else {
          // COD thất bại, chỉ cập nhật status
          await orderModel.findByIdAndUpdate(orderId, { status: "Đã hủy" });
        }
      }
      
      res.json({ success: false, message: "Thanh toán thất bại" });
    }
  } catch (error) {
    console.error("Verify order error:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
};

// Lấy danh sách đơn hàng của người dùng
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.user._id }).sort({ date: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("User orders error:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
};

// Lấy danh sách tất cả đơn hàng (Admin)
const listOrders = async (req, res) => {
  try {
    
    const { page = 1, limit = 50, status, paymentStatus, search } = req.query;
    
    let filter = {};
    
    if (status && status !== "all") {
      filter.status = status;
    }
    
    if (paymentStatus === "paid") {
      filter.payment = true;
    } else if (paymentStatus === "unpaid") {
      filter.payment = false;
    }
    
    if (search) {
      filter.$or = [
        { _id: { $regex: search, $options: 'i' } },
        { "address.email": { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await orderModel
      .find(filter)
      .populate('userId', 'name email')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await orderModel.countDocuments(filter);

    // Thống kê tổng quan
    const stats = await orderModel.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$amount" },
          totalDiscount: { $sum: "$discountAmount" },
          avgOrderValue: { $avg: "$amount" }
        }
      }
    ]);

    res.json({ 
      success: true, 
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      stats: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        totalDiscount: 0,
        avgOrderValue: 0
      }
    });
  } catch (error) {
    console.error("List orders error:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
};

// Cập nhật trạng thái đơn hàng (Updated với trạng thái mới)
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    
    if (!orderId || !status) {
      return res.status(400).json({ 
        success: false, 
        message: "Thiếu thông tin orderId hoặc status" 
      });
    }

    const validStatuses = ["Đặt thành công", "Đang xử lý", "Đã hoàn thành", "Đã hủy"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Trạng thái không hợp lệ" 
      });
    }

    // Lấy thông tin đơn hàng hiện tại
    const currentOrder = await orderModel.findById(orderId);
    if (!currentOrder) {
      return res.status(404).json({ 
        success: false, 
        message: "Không tìm thấy đơn hàng" 
      });
    }

    // Kiểm tra điều kiện cập nhật trạng thái "Đã hủy"
    if (status === "Đã hủy") {
      if (currentOrder.payment === true) {
        return res.status(400).json({ 
          success: false, 
          message: "Không thể hủy đơn hàng đã thanh toán" 
        });
      }
    }
    
    const order = await orderModel.findByIdAndUpdate(orderId, {
      status: status,
      updatedAt: new Date(),
      ...(status === "Đã hủy" && { cancelledAt: new Date() })
    }, { new: true });

    // console.log(`Order ${orderId} status updated to: ${status} by admin ${req.user.email}`);

    res.json({ 
      success: true, 
      message: "Cập nhật trạng thái thành công", 
      order 
    });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
};

// Lấy đơn hàng của tôi với phân trang
const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    let filter = { userId: req.user._id };
    if (status && status !== "all") {
      filter.status = status;
    }

    const orders = await orderModel
      .find(filter)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await orderModel.countDocuments(filter);

    res.json({ 
      success: true, 
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get my orders error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Lỗi khi lấy danh sách đơn hàng" 
    });
  }
};

// Lấy chi tiết đơn hàng
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await orderModel
      .findById(id)
      .populate('userId', 'name email phone');

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Không tìm thấy đơn hàng" 
      });
    }

    // Kiểm tra quyền truy cập
    if (req.user.role !== "admin" && order.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: "Bạn không có quyền xem đơn hàng này" 
      });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Lỗi khi lấy chi tiết đơn hàng" 
    });
  }
};

// Hủy đơn hàng (Updated với điều kiện mới)
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ 
        success: false, 
        message: "Thiếu thông tin orderId" 
      });
    }
    
    const order = await orderModel.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Không tìm thấy đơn hàng" 
      });
    }

    // Kiểm tra quyền hủy đơn
    if (req.user.role !== "admin" && order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: "Bạn không có quyền hủy đơn hàng này" 
      });
    }

    // Kiểm tra điều kiện hủy đơn hàng
    if (order.payment === true) {
      return res.status(400).json({ 
        success: false, 
        message: "Không thể hủy đơn hàng đã thanh toán" 
      });
    }

    // Kiểm tra trạng thái đơn hàng
    if (!["Đặt thành công", "Đang xử lý"].includes(order.status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Không thể hủy đơn hàng ở trạng thái hiện tại" 
      });
    }

    // Hoàn lại stock
    for (const item of order.items) {
      await productModel.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity }
      });
    }

    // Hoàn lại coupon usage nếu có
    if (order.coupon) {
      await rollbackCouponUsage(orderId, order.coupon.couponId);
    }

    // Cập nhật trạng thái đơn hàng
    await orderModel.findByIdAndUpdate(orderId, { 
      status: "Đã hủy",
      cancelledAt: new Date()
    });

    res.json({ 
      success: true, 
      message: "Hủy đơn hàng thành công" 
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Lỗi khi hủy đơn hàng" 
    });
  }
};

export {
  placeOrder,
  verifyOrder,
  userOrders,
  listOrders,
  updateStatus,
  getMyOrders,
  getOrderById,
  cancelOrder
};