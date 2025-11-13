import express from "express"
import morgan from "morgan" 
import rateLimit from "express-rate-limit"
import helmet from "helmet"
import mongoSanitize from 'express-mongo-sanitize'
import hpp from "hpp"
import cookieParser from "cookie-parser"
import cors from 'cors'
import healthRoute from "./routes/health.routes.js"
import userRoute from './routes/user.route.js'


import dotenv from "dotenv"
dotenv.config()

const app = express()
const PORT = process.env.PORT


// Global rate limiting 
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true, // Enable `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
})

// security  middleware
app.use(helmet())
app.use(mongoSanitize())
app.use(hpp())
app.use("/api",limiter) ; // where ever the api is called in the search then enject the limiter



// logging middleware
if(process.env.NODE_ENV==="development"){
    app.use(morgan("dev"))
}

// Body Parser Middleware
app.use(express.json({limit:'10kb'}))
app.use(express.urlencoded({extended:true,limit:'10kb'}))
app.use(cookieParser())

// Global Error Handler
app.use((err,req,res,next)=>{
    console.error(err.stack)
    res.status(err.status || 500).json({
        status:"error",
        message:err.message || "Internal Server Error",
        ...(process.env.NODE_ENV==="development" && {stack:err.stack})
    })
})

app.use(cors({
    origin:process.env.CLIENT_URL || "https://localhost:5173",
    credentials:true,
    methods:["GET","POST","DELETE","PATCH","HEAD","OPTIONS"],
    allowedHeaders:[
        "Content-type",
        "Authorization",
        "X-Requested-With",
        "device-remember-token",
        "Orgin",
        "Accept"
    ]
}))

// API Routes

app.use('/api/v1/healthcheck',healthRoute)
app.use('/api/v1/user',userRoute)



// it should be always at bottom 
// 404 handler
app.use((req,res)=>{
    res.status(404).json({
        "status":"error",
        "message":"route not found"
    })
})

app.listen(PORT,()=>{
    console.log(`Port is running on ${PORT}`)
})