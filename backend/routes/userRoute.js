import express from "express"
import { 
    loginUser, 
    registerUser, 
    getUserProfile, 
    saveAddress, 
    getAllUsers,
    createUser,
    updateUser,
    deleteUser
} from "../controllers/userController.js"
import requireAuth from "../middleware/auth.js";

const userRoute = express.Router();

// Authentication routes
userRoute.post("/login", loginUser);
userRoute.post("/register", registerUser);

// User profile routes
userRoute.get("/profile", requireAuth, getUserProfile);
userRoute.post("/save-address", requireAuth, saveAddress);

// Admin-only user management routes
userRoute.get("/all", requireAuth, getAllUsers);
userRoute.post("/create", requireAuth, createUser);
userRoute.put("/update/:id", requireAuth, updateUser);
userRoute.delete("/delete/:id", requireAuth, deleteUser);

export default userRoute;