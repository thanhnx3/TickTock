import express from "express"
import { addToCart, removeFromCart, getCart } from "../controllers/cartController.js"
import requireAuth from "../middleware/auth.js" // Đổi thành requireAuth

const cartRouter = express.Router()

cartRouter.post("/add", requireAuth, addToCart)
cartRouter.post("/remove", requireAuth, removeFromCart)
cartRouter.post("/get", requireAuth, getCart)

export default cartRouter