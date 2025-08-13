import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Không có token xác thực" });
  }

  const token = authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Thêm userId vào req để sử dụng ở middleware hoặc controller
    req.userId = decoded.id;

    // Nếu cần lấy full user (và role) để kiểm tra quyền hạn
    req.user = await userModel.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Người dùng không hợp lệ" });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ success: false, message: "Token không hợp lệ" });
  }
};

export default requireAuth;