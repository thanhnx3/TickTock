import express from "express";
import {
  applyCoupon,
  createCoupon,
  listCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  getAvailableCoupons,
  getCouponStats,
  toggleCouponStatus
} from "../controllers/couponController.js";
import requireAuth from "../middleware/auth.js";

const couponRouter = express.Router();

// Routes cho user (chỉ cần xác thực)
couponRouter.post("/apply", requireAuth, applyCoupon);                    
couponRouter.get("/available", requireAuth, getAvailableCoupons);         

// Routes cho admin (xác thực + kiểm tra role trong controller)
couponRouter.post("/create", requireAuth, createCoupon);                  
couponRouter.get("/list", requireAuth, listCoupons);                      
couponRouter.get("/stats", requireAuth, getCouponStats);                  
couponRouter.get("/:id", requireAuth, getCouponById);                     
couponRouter.put("/:id", requireAuth, updateCoupon);                      
couponRouter.delete("/:id", requireAuth, deleteCoupon);                   
couponRouter.patch('/:id/toggle', requireAuth, toggleCouponStatus);

export default couponRouter;