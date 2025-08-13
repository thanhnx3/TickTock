import express from "express";
import { createProduct, listProducts, deleteProduct, getProduct, searchProducts, updateProduct, applyDiscountAll } from "../controllers/productController.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import requireAuth from "../middleware/auth.js"; // Đổi thành requireAuth

const productRouter = express.Router();

// Cấu hình cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage });

productRouter.post("/create", requireAuth, upload.array("image", 4), createProduct);
productRouter.get("/list", listProducts);
productRouter.post("/update", requireAuth, updateProduct); // Thêm auth
productRouter.post("/delete", requireAuth, deleteProduct); // Thêm auth
productRouter.get("/get/:id", getProduct);
productRouter.get("/search", searchProducts);
productRouter.post('/discount-all', requireAuth, applyDiscountAll);
// productRouter.post("/update-stock", requireAuth, updateProductStock);


export default productRouter;