import express from "express";
import requireAuth from "../middleware/auth.js";
import { 
  listOrders, 
  placeOrder, 
  updateStatus, 
  userOrders, 
  verifyOrder, 
  getMyOrders,
  getOrderById,
  cancelOrder
} from "../controllers/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/place", requireAuth, placeOrder);
orderRouter.post("/verify", verifyOrder); // Không cần auth
orderRouter.post("/userOrders", requireAuth, userOrders);
orderRouter.get("/list", listOrders);
orderRouter.post("/status", requireAuth, updateStatus);
orderRouter.get("/my-orders", requireAuth, getMyOrders);
orderRouter.get("/:id", requireAuth, getOrderById);
orderRouter.post("/cancel", requireAuth, cancelOrder);

export default orderRouter;

// orderRouter.post("/place", authMiddleware, placeOrder);
// orderRouter.post("/verify", verifyOrder);
// orderRouter.post("/userOrders", authMiddleware, userOrders);
// orderRouter.get("/list", listOrders);
// orderRouter.post("/status", updateStatus);
// orderRouter.get("/my-orders", requireAuth, getMyOrders);