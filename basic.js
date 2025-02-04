
const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://User:praneeth@cluster0.srzjk.mongodb.net/users");

const User= mongoose.model('user_sub',{ name:String , email:String, password: String})

const user = new User({
    name:"Praneeth",
    email:"abc@gmail.com",
    password: "password"
})

user.save();

