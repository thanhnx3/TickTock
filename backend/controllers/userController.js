import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

// Đăng nhập người dùng
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "Người dùng không tồn tại" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Sai thông tin đăng nhập" });
    }
    
    user.lastLogin = new Date();
    await user.save();

    const token = createToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Lỗi hệ thống" });
  }
};

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Đăng ký người dùng
const registerUser = async (req, res) => {
  const { name, password, email } = req.body;
  try {
    // Kiểm tra xem người dùng đã tồn tại chưa
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "Người dùng đã tồn tại" });
    }

    // Xác thực email hợp lệ & mật khẩu đủ mạnh
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Vui lòng nhập email hợp lệ",
      });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Mật khẩu phải có ít nhất 8 ký tự",
      });
    }

    // Băm mật khẩu người dùng
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name: name,
      email: email,
      password: hashedPassword,
    });

    const user = await newUser.save();
    const token = createToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Lỗi hệ thống" });
  }
};

// Lấy thông tin user từ token
const getUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

const saveAddress = async (req, res) => {
  try {
    const userId = req.userId; // đúng là req.userId
    const { fullName, phoneNumber, pincode, area, city, state } = req.body;

    const address = { fullName, phoneNumber, pincode, area, city, state };

    const user = await userModel.findByIdAndUpdate(
      userId,
      { address },
      { new: true }
    );

    res.json({
      success: true,
      message: "Địa chỉ đã được lưu",
      address: user.address,
    });
  } catch (error) {
    console.log("❌ Lỗi lưu địa chỉ:", error);
    res.status(500).json({ success: false, message: "Lỗi khi lưu địa chỉ" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    if (!req.user || req.user.role !== true) {
      return res
        .status(403)
        .json({ success: false, message: "Bạn không có quyền truy cập" });
    }

    const users = await userModel.find().select("-password");
    res.json({ success: true, users });
  } catch (error) {
    console.error("Lỗi getAllUsers:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

// Tạo user mới (Admin only)
const createUser = async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (!req.user || req.user.role !== true) {
      return res
        .status(403)
        .json({ success: false, message: "Bạn không có quyền truy cập" });
    }

    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng điền đầy đủ thông tin" });
    }

    // Kiểm tra email hợp lệ
    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Email không hợp lệ" });
    }

    // Kiểm tra độ dài mật khẩu
    if (password.length < 8) {
      return res
        .status(400)
        .json({ success: false, message: "Mật khẩu phải có ít nhất 8 ký tự" });
    }

    // Kiểm tra email đã tồn tại
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email đã được sử dụng" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo user mới
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      role: role || false,
    });

    const savedUser = await newUser.save();

    // Trả về user không có password
    const userResponse = await userModel
      .findById(savedUser._id)
      .select("-password");

    res.status(201).json({
      success: true,
      message: "Tạo người dùng thành công",
      user: userResponse,
    });
  } catch (error) {
    console.error("Lỗi createUser:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

// Cập nhật user (Admin only)
const updateUser = async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (!req.user || req.user.role !== true) {
      return res
        .status(403)
        .json({ success: false, message: "Bạn không có quyền truy cập" });
    }

    const { id } = req.params;
    const { name, email, role } = req.body;

    // Validate input
    if (!name || !email) {
      return res
        .status(400)
        .json({ success: false, message: "Tên và email không được để trống" });
    }

    // Kiểm tra email hợp lệ
    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Email không hợp lệ" });
    }

    // Kiểm tra user tồn tại
    const user = await userModel.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    }

    // Kiểm tra email đã được sử dụng bởi user khác
    const existingUser = await userModel.findOne({ email, _id: { $ne: id } });
    if (existingUser) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Email đã được sử dụng bởi người dùng khác",
        });
    }

    // Cập nhật user
    const updatedUser = await userModel
      .findByIdAndUpdate(
        id,
        { name, email, role: role !== undefined ? role : user.role },
        { new: true }
      )
      .select("-password");

    res.json({
      success: true,
      message: "Cập nhật người dùng thành công",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Lỗi updateUser:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

// Xóa user (Admin only)
const deleteUser = async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (!req.user || req.user.role !== true) {
      return res
        .status(403)
        .json({ success: false, message: "Bạn không có quyền truy cập" });
    }

    const { id } = req.params;

    // Kiểm tra không được xóa chính mình
    if (req.user.id === id) {
      return res
        .status(400)
        .json({ success: false, message: "Không thể xóa chính mình" });
    }

    // Kiểm tra user tồn tại
    const user = await userModel.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    }

    // Xóa user
    await userModel.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Xóa người dùng thành công",
    });
  } catch (error) {
    console.error("Lỗi deleteUser:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

export {
  loginUser,
  registerUser,
  getUserProfile,
  saveAddress,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
};
