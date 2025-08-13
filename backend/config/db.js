import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://adm-tt:admtt123@cluster0.xe21nsc.mongodb.net/food-del').then(()=>console.log("DB Connected"))
}