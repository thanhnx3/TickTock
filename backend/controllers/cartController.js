import userModel from "../models/userModel.js";

const addToCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId);
    const cartData = user.cartData || {};
    const itemId = req.body.itemId;
    cartData[itemId] = (cartData[itemId] || 0) + 1;
    await userModel.findByIdAndUpdate(req.body.userId, { cartData });
    res.json({ success: true, message: "Đã thêm vào giỏ hàng" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Lỗi hệ thống" });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId);
    const cartData = user.cartData || {};
    const itemId = req.body.itemId;
    if (cartData[itemId] > 0) {
      cartData[itemId] -= 1;
    }
    if (cartData[itemId] === 0) {
      delete cartData[itemId];
    }
    await userModel.findByIdAndUpdate(req.body.userId, { cartData });
    res.json({ success: true, message: "Đã xoá khỏi giỏ hàng" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Lỗi hệ thống" });
  }
};

const getCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId);
    const cartData = user.cartData || {};
    res.json({ success: true, cartData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Lỗi hệ thống" });
  }
};

export { addToCart, removeFromCart, getCart };