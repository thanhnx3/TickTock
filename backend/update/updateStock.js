// import mongoose from "mongoose";
// import userModel from "../models/userModel.js";

// const MONGO_URL = "mongodb+srv://adm-tt:admtt123@cluster0.xe21nsc.mongodb.net/food-del"; // hoặc URI MongoDB Atlas

// const updateOldUsers = async () => {
//   try {
//     await mongoose.connect(MONGO_URL);
//     console.log("✅ Đã kết nối MongoDB");

//     // Cập nhật user KHÔNG có createdAt
//     const result = await userModel.updateMany(
//       { createdAt: { $exists: false } },
//       {
//         $set: {
//           createdAt: new Date("2024-01-01T00:00:00.000Z"),
//           lastLogin: null,
//         },
//       }
//     );

//     console.log(`✔️ Đã cập nhật ${result.modifiedCount} tài khoản cũ.`);
//     process.exit(0);
//   } catch (err) {
//     console.error("❌ Lỗi khi cập nhật:", err);
//     process.exit(1);
//   }
// };

// updateOldUsers();
