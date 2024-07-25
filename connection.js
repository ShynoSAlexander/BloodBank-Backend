//1. import mongoose
const mongoose=require('mongoose');
mongoose.connect("mongodb+srv://shynosalexander:shyno@cluster0.zdqdhmf.mongodb.net/OpenBatchdb1?retryWrites=true&w=majority&appName=Cluster0")
.then(()=>{
    console.log("Connected to mongodb")
})
.catch((error)=>{
console.log(error)
})