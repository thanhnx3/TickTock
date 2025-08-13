import mongoose from "mongoose";

// Schema cho Coupon
const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  discountType: {
    type: String,
    enum: ["fixed", "percentage"],
    required: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  maxDiscount: {
    type: Number,
    default: null // Chỉ áp dụng cho percentage coupon
  },
  minOrderValue: {
    type: Number,
    default: 0
  },
  maxUses: {
    type: Number,
    default: null // null = unlimited
  },
  currentUses: {
    type: Number,
    default: 0
  },
  maxUsesPerUser: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  }], // Nếu rỗng = áp dụng cho tất cả sản phẩm
  applicableCategories: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Schema cho CouponUsage
const couponUsageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  couponId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Coupon",
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },
  discountAmount: {
    type: Number,
    required: true
  },
  usedAt: {
    type: Date,
    default: Date.now
  }
});

// Tạo index để tìm kiếm nhanh
couponSchema.index({ isActive: 1, expiryDate: 1 });
couponUsageSchema.index({ userId: 1, couponId: 1 });

// Export cả hai model
const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);
const CouponUsage = mongoose.models.CouponUsage || mongoose.model("CouponUsage", couponUsageSchema);

export { Coupon, CouponUsage };
export default Coupon;