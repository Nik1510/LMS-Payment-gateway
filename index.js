import express from "express"
import morgan from "morgan" 

import dotenv from "dotenv"
dotenv.config()

const app = express()
const PORT = process.env.PORT


// logging middleware
if(process.env.NODE_ENV==="development"){
    app.use(morgan("dev"))
}

// Body Parser Middleware
app.use(express.json({limit:'10kb'}))
app.use(express.urlencoded({extended:true,limit:'10kb'}))

// Global Error Handler
app.use((err,req,res,next)=>{
    console.error(err.stack)
    res.status(err.status || 500).json({
        status:"error",
        message:err.message || "Internal Server Error",
        ...(process.env.NODE_ENV==="development" && {stack:err.stack})
    })
})


// API Routes





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