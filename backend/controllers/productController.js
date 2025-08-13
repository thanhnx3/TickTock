import productModel from "../models/productModel.js";
import cloudinary from "../utils/cloudinary.js"; 
import fs from "fs";

// Lấy chi tiết sản phẩm theo ID
const getProduct = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);
        if (product) {
            res.json({ success: true, data: product });
        } else {
            res.status(404).json({ success: false, message: "Product not found" });
        }
    } catch (error) {
        res.status(400).json({ success: false, message: "Invalid ID" });
    }
};

// Thêm sản phẩm mới
const createProduct = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "Không có ảnh được upload" });
    }

    // Lấy URL đầy đủ từ Cloudinary
    const images = req.files.map((file) => file.path || file.secure_url);

    const product = new productModel({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      offerPrice: req.body.offerPrice,
      category: req.body.category,
      stock: req.body.stock,
      image: images,
    });

    await product.save();
    res.json({ success: true, message: "Thêm sản phẩm thành công!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi khi thêm sản phẩm" });
  }
};

// Lấy danh sách sản phẩm
const listProducts = async (req, res) => {
    try {
        const products = await productModel.find({});
        res.json({ success: true, data: products });
    } catch (error) {
        res.json({ success: false, message: "Error" });
    }
};

// Cập nhật sản phẩm
const updateProduct = async (req, res) => {
  try {
    const { id, name, category, offerPrice, stock } = req.body;

    // Validate required fields
    if (!id) {
      return res.json({ 
        success: false, 
        message: "ID sản phẩm là bắt buộc" 
      });
    }

    if (!name || !category || !offerPrice) {
      return res.json({ 
        success: false, 
        message: "Tên, danh mục và giá là bắt buộc" 
      });
    }

    // Validate price
    if (isNaN(offerPrice) || offerPrice <= 0) {
      return res.json({ 
        success: false, 
        message: "Giá phải là số dương" 
      });
    }

    // Validate stock
    if (stock !== undefined && (isNaN(stock) || stock < 0)) {
      return res.json({ 
        success: false, 
        message: "Số lượng kho phải là số không âm" 
      });
    }

    // Tìm và cập nhật sản phẩm
    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        category: category.trim(),
        offerPrice: Number(offerPrice),
        stock: stock !== undefined ? Number(stock) : undefined
      },
      { 
        new: true, // Trả về document sau khi update
        runValidators: true // Chạy validation của schema
      }
    );

    if (!updatedProduct) {
      return res.json({ 
        success: false, 
        message: "Không tìm thấy sản phẩm" 
      });
    }

    res.json({
      success: true,
      message: "Cập nhật sản phẩm thành công",
      data: updatedProduct
    });

  } catch (error) {
    console.log("Error updating product:", error);
    res.json({ 
      success: false, 
      message: "Lỗi server khi cập nhật sản phẩm" 
    });
  }
};

// Xóa sản phẩm
const deleteProduct = async (req, res) => {
    try {
        const product = await productModel.findById(req.body.id);
        if (product.image) {
            fs.unlink(`uploads/${product.image}`, () => {});
        }

        await productModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Product Removed" });
    } catch (error) {
        res.json({ success: false, message: "Error" });
    }
};

// Tìm kiếm sản phẩm
const searchProducts = async (req, res) => {
  try {
    const { keyword, category, page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;
    let query = {}; 

    if (keyword) {
      query.name = { $regex: keyword, $options: 'i' }; 
    }

    if (category && category !== 'Tất cả') {
      query.category = category;
    }

    const skip = (page - 1) * limit;
    const products = await productModel
      .find(query)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip(skip) 
      .limit(Number(limit)); 

    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi khi tìm kiếm sản phẩm" });
  }
};

// Cập nhật số lượng sản phẩm trong kho
const updateProductStock = async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ 
        success: false, 
        message: "Vui lòng cung cấp danh sách sản phẩm hợp lệ"
      });
    }
    
    const updateResults = [];
    let hasError = false;
    
    // Xử lý từng sản phẩm trong danh sách
    for (const item of items) {
      const { productId, quantity } = item;
      
      if (!productId || !quantity || isNaN(quantity) || quantity <= 0) {
        updateResults.push({
          productId,
          success: false,
          message: "ID sản phẩm hoặc số lượng không hợp lệ"
        });
        hasError = true;
        continue;
      }
      
      // Tìm sản phẩm
      const product = await productModel.findById(productId);
      
      if (!product) {
        updateResults.push({
          productId,
          success: false,
          message: "Không tìm thấy sản phẩm"
        });
        hasError = true;
        continue;
      }
      
      // Kiểm tra số lượng trong kho có đủ không
      if (product.stock < quantity) {
        updateResults.push({
          productId,
          success: false,
          message: "Số lượng sản phẩm trong kho không đủ",
          availableStock: product.stock
        });
        hasError = true;
        continue;
      }
      
      // Cập nhật số lượng trong kho
      product.stock -= quantity;
      await product.save();
      
      updateResults.push({
        productId,
        success: true,
        message: "Cập nhật số lượng thành công",
        newStock: product.stock
      });
    }
    
    if (hasError) {
      return res.status(400).json({
        success: false,
        message: "Có lỗi xảy ra khi cập nhật số lượng sản phẩm",
        results: updateResults
      });
    }
    
    return res.json({
      success: true,
      message: "Cập nhật số lượng sản phẩm thành công",
      results: updateResults
    });
    
  } catch (error) {
    console.error("Lỗi khi cập nhật số lượng sản phẩm:", error);
    res.status(500).json({ 
      success: false, 
      message: "Lỗi khi cập nhật số lượng sản phẩm"
    });
  }
};

// Hàm helper để làm tròn giá tiền
const roundPrice = (price, roundTo = 1000) => {
  return Math.round(price / roundTo) * roundTo;
};

// Hàm tự động chọn mức làm tròn phù hợp
// Làm tròn giá theo logic: làm tròn lên/xuống tùy mức giá
const smartRoundPrice = (price) => {
  if (price >= 1000000) {
    return Math.round(price / 1000) * 1000;
  } else if (price >= 100000) {
    const remainder = price % 1000;

    if (remainder >= 500) {
      return Math.ceil(price / 1000) * 1000;
    } else {
      return Math.floor(price / 1000) * 1000; 
    }

  } else if (price >= 10000) {
    return Math.round(price / 100) * 100;
  } else {
    return Math.round(price);
  }
};


const applyDiscountAll = async (req, res) => {
  try {
    const { discountPercent } = req.body;

    // Validate input
    if (!discountPercent || discountPercent <= 0 || discountPercent > 100) {
      return res.status(400).json({ 
        success: false, 
        message: "Phần trăm giảm giá không hợp lệ (1-100)" 
      });
    }

    // Lấy tất cả sản phẩm
    const products = await productModel.find();
    
    if (products.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Không có sản phẩm nào để áp dụng giảm giá" 
      });
    }

    // Tính toán và cập nhật giá cho từng sản phẩm
    const updates = products.map(async (product) => {
      try {
        // Tính giá sau khi giảm
        const originalPrice = Number(product.price) || 0;
        const discountAmount = originalPrice * (discountPercent / 100);
        const discountedPrice = originalPrice - discountAmount;
        
        // Làm tròn giá theo mức phù hợp
        const roundedPrice = smartRoundPrice(discountedPrice);
        
        // Đảm bảo giá không âm và không lớn hơn giá gốc
        const finalPrice = Math.max(1000, Math.min(roundedPrice, originalPrice));
        
        console.log(`📦 ${product.name}: ${originalPrice.toLocaleString()} → ${finalPrice.toLocaleString()} VND`);
        
        // Cập nhật sản phẩm
        return await productModel.findByIdAndUpdate(
          product._id, 
          { offerPrice: finalPrice },
          { new: true }
        );
      } catch (error) {
        console.error(`❌ Lỗi cập nhật sản phẩm ${product.name}:`, error);
        return null;
      }
    });

    // Thực hiện tất cả cập nhật
    const results = await Promise.all(updates);
    const successCount = results.filter(result => result !== null).length;
    const failCount = results.length - successCount;

    if (failCount > 0) {
      console.warn(`⚠️ ${failCount} sản phẩm không được cập nhật thành công`);
    }

    res.json({ 
      success: true, 
      message: `Đã áp dụng giảm giá ${discountPercent}% cho ${successCount}/${products.length} sản phẩm`,
      details: {
        total: products.length,
        success: successCount,
        failed: failCount,
        discountPercent: discountPercent
      }
    });

  } catch (error) {
    console.error("❌ Lỗi applyDiscountAll:", error);
    res.status(500).json({ 
      success: false, 
      message: "Lỗi server khi cập nhật giảm giá",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Hàm bổ sung: Áp dụng giảm giá cho sản phẩm cụ thể
const applyDiscountToProduct = async (req, res) => {
  try {
    const { productId, discountPercent } = req.body;

    if (!productId || !discountPercent || discountPercent <= 0 || discountPercent > 100) {
      return res.status(400).json({ 
        success: false, 
        message: "ID sản phẩm và phần trăm giảm giá là bắt buộc" 
      });
    }

    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Không tìm thấy sản phẩm" 
      });
    }

    const originalPrice = Number(product.price) || 0;
    const discountedPrice = originalPrice * (1 - discountPercent / 100);
    const finalPrice = smartRoundPrice(discountedPrice);

    await productModel.findByIdAndUpdate(productId, { offerPrice: finalPrice });

    res.json({ 
      success: true, 
      message: `Đã áp dụng giảm giá ${discountPercent}% cho sản phẩm`,
      data: {
        originalPrice,
        discountedPrice: finalPrice,
        savedAmount: originalPrice - finalPrice
      }
    });

  } catch (error) {
    console.error("❌ Lỗi applyDiscountToProduct:", error);
    res.status(500).json({ 
      success: false, 
      message: "Lỗi khi áp dụng giảm giá cho sản phẩm" 
    });
  }
};

export { 
  getProduct, 
  createProduct, 
  listProducts, 
  updateProduct, 
  deleteProduct, 
  searchProducts, 
  updateProductStock, 
  applyDiscountAll,
  applyDiscountToProduct 
};