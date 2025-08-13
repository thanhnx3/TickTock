import Coupon from "../models/couponModel.js";
import { CouponUsage } from "../models/couponModel.js";
import mongoose from "mongoose";

// Create coupon
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      maxDiscount,
      minOrderValue,
      maxUses,
      maxUsesPerUser,
      expiryDate,
      startDate,
      applicableProducts,
      applicableCategories
    } = req.body;

    const exists = await Coupon.findOne({ code });
    if (exists) {
      return res.status(400).json({ success: false, message: "Mã giảm giá đã tồn tại" });
    }

    const coupon = await Coupon.create({
      code,
      description,
      discountType,
      discountValue,
      maxDiscount,
      minOrderValue,
      maxUses,
      maxUsesPerUser,
      expiryDate,
      startDate,
      applicableProducts,
      applicableCategories
    });

    res.status(201).json({ success: true, message: "Tạo mã giảm giá thành công", coupon });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// List coupons with usage count
export const listCoupons = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "all";

    const query = {};
    if (search) {
      query.code = { $regex: search, $options: "i" };
    }
    if (status === "active") {
      query.isActive = true;
      query.expiryDate = { $gte: new Date() };
    } else if (status === "expired") {
      query.expiryDate = { $lt: new Date() };
    }

    const total = await Coupon.countDocuments(query);
    const coupons = await Coupon.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "couponusages",
          localField: "_id",
          foreignField: "couponId",
          as: "usages"
        }
      },
      {
        $addFields: {
          totalUsed: { $size: "$usages" }
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ]);

    res.json({
      success: true,
      coupons,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Get single coupon
export const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Không tìm thấy mã giảm giá" });
    }
    res.json({ success: true, coupon });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Update coupon
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Không tìm thấy mã giảm giá" });
    }

    Object.assign(coupon, req.body);
    await coupon.save();

    res.json({ success: true, message: "Cập nhật thành công", coupon });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Delete coupon
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Không tìm thấy mã giảm giá" });
    }
    await coupon.deleteOne();
    res.json({ success: true, message: "Đã xóa mã giảm giá" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Apply coupon
export const applyCoupon = async (req, res) => {
  try {
    const { code, totalAmount, userId, orderId } = req.body;
    
    // Tạo session để đảm bảo tính nhất quán
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const coupon = await Coupon.findOne({ code: code.toUpperCase() }).session(session);

      if (!coupon || !coupon.isActive || coupon.expiryDate < new Date()) {
        throw new Error("Mã giảm giá không hợp lệ hoặc đã hết hạn");
      }

      // Kiểm tra ngày bắt đầu
      if (coupon.startDate && new Date(coupon.startDate) > new Date()) {
        throw new Error("Mã giảm giá chưa có hiệu lực");
      }

      // Kiểm tra đơn hàng tối thiểu
      if (coupon.minOrderValue && totalAmount < coupon.minOrderValue) {
        throw new Error(`Đơn hàng phải tối thiểu ${coupon.minOrderValue.toLocaleString('vi-VN')}đ để áp dụng mã`);
      }

      // Kiểm tra số lần sử dụng tối đa
      if (coupon.maxUses) {
        const totalUsed = await CouponUsage.countDocuments({ 
          couponId: coupon._id 
        }).session(session);
        
        if (totalUsed >= coupon.maxUses) {
          throw new Error("Mã giảm giá đã hết lượt sử dụng");
        }
      }

      // Kiểm tra số lần sử dụng của user
      if (userId) {
        const userUsageCount = await CouponUsage.countDocuments({ 
          couponId: coupon._id, 
          userId: userId 
        }).session(session);
        
        if (userUsageCount >= coupon.maxUsesPerUser) {
          throw new Error(`Bạn đã sử dụng hết lượt cho mã này (${coupon.maxUsesPerUser} lần)`);
        }
      }

      // Tính toán discount
      let discount = 0;
      if (coupon.discountType === "fixed") {
        discount = coupon.discountValue;
      } else {
        discount = (coupon.discountValue / 100) * totalAmount;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      }

      // Nếu có orderId thì ghi nhận sử dụng (khi đơn hàng thành công)
      if (orderId) {
        await CouponUsage.create([{
          couponId: coupon._id,
          userId: userId,
          orderId: orderId,
          discountAmount: discount,
          usedAt: new Date()
        }], { session });
      }

      await session.commitTransaction();

      res.json({ 
        success: true, 
        discount,
        message: orderId ? "Áp dụng mã giảm giá thành công" : "Mã giảm giá hợp lệ",
        coupon: {
          _id: coupon._id,
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue
        }
      });

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

  } catch (err) {
    console.error(err);
    res.status(400).json({ 
      success: false, 
      message: err.message || "Lỗi server" 
    });
  }
};

// Get available coupons
export const getAvailableCoupons = async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gte: now },
      $or: [
        { startDate: { $exists: false } },
        { startDate: { $lte: now } }
      ]
    }).sort({ createdAt: -1 });

    res.json({ success: true, coupons });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Get coupon stats
export const getCouponStats = async (req, res) => {
  try {
    const totalCoupons = await Coupon.countDocuments();
    const activeCoupons = await Coupon.countDocuments({ 
      isActive: true,
      expiryDate: { $gte: new Date() }
    });
    const expiredCoupons = await Coupon.countDocuments({ 
      expiryDate: { $lt: new Date() } 
    });
    const totalUsages = await CouponUsage.countDocuments();

    res.json({
      success: true,
      stats: {
        totalCoupons,
        activeCoupons,
        expiredCoupons,
        totalUsages
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

export const toggleCouponStatus = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: "Không tìm thấy mã" });

    coupon.isActive = req.body.isActive;
    await coupon.save();

    res.json({ success: true, message: "Đã cập nhật trạng thái mã giảm giá" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
