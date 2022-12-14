//jshint esversion:6\
require("dotenv").config();
const express=require("express");
const ejs=require("ejs");
const mongoose=require("mongoose");
const bodyparser=require("body-parser");
const app=express();
const encrypt=require("mongoose-encryption");

app.use(bodyparser.urlencoded({
  extended:true
}))

app.use(express.static("public"));
app.set("view engine" , "ejs");

mongoose.connect("mongodb+srv://dhruv:Dhruv@cluster0.rapcoui.mongodb.net/SecurityDB");

const newUserSchema=new mongoose.Schema({
   name:String,
   password:String
});


newUserSchema.plugin(encrypt, { secret: process.env.SECRET,encryptedFields: ['password'] });

const NewUser=mongoose.model("NewUser",newUserSchema);

app.get("/",(req,res)=>{
  res.render("home");
})

app.get("/login",(req,res)=>{
  res.render("login");
})


app.get("/register",(req,res)=>{
  res.render("register");
})

app.post("/register",(req,res)=>{
  const UserName=req.body.username;
  const Password=req.body.password;

  const newuser=new NewUser({
    name:UserName,
    password:Password
  })

  newuser.save();

  res.render("secrets");
})

app.post("/login",(req,res)=>{
  const UserName=req.body.username;
  const Password=req.body.password;

  NewUser.findOne({name:UserName},(err,found)=>{
    if(!err){
      if(found.password===Password){
        res.render("secrets")
      }else{
        res.render("login")
      }
    }
  })
})




app.listen(3000,()=>{
  console.log("running on 3000");
});
