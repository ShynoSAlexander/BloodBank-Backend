var mongoose=require('mongoose')
var schema=mongoose.Schema({
    Firstname:String,
    Lastname:String,
    Email:String,
    Password:String
})
const userModel=mongoose.model("user",schema)
module.exports=userModel
