import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import productRouter from "./routes/productRouter.js"
import userRoute from "./routes/userRoute.js"
import 'dotenv/config.js'
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
import couponRoute from "./routes/couponRoute.js";



// app config
const app = express()
const port = 4000

// middleware
app.use(express.json())
// app.use(cors())
app.use(cors({
  origin: ["https://tictock.vercel.app"],
  credentials: true
}));


// db connection
connectDB();

// api endpoints
app.use("/api/product",productRouter)
app.use("/uploads", express.static('uploads'));
app.use("/api/user",userRoute)
app.use("/api/cart",cartRouter)
app.use("/api/order",orderRouter)
app.use("/api/coupon", couponRoute);



app.get("/",(req,res)=>{
    res.send("API Working")
})

app.listen(port,()=>{
    console.log(`Server Started on http://localhost:${port}`)
    
})



//mongodb+srv://ngothanh2011:<password>@greatstack.qopek3c.mongodb.net/?
//retryWrites=true&w=majority&appName=GreatStack