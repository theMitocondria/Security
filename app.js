//jshint esversion:6\
require("dotenv").config();
const express=require("express");
const ejs=require("ejs");
const mongoose=require("mongoose");
const bodyparser=require("body-parser");
const app=express();
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');


app.use(bodyparser.urlencoded({
  extended:true
}))

app.use(express.static("public"));
app.set("view engine" , "ejs");

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://dhruv:Dhruv@cluster0.rapcoui.mongodb.net/SecurityDB");

const newUserSchema=new mongoose.Schema({
   username:String,
   password:String
});

newUserSchema.plugin(passportLocalMongoose);
newUserSchema.plugin(findOrCreate);

const NewUser=mongoose.model("NewUser",newUserSchema);

passport.use(NewUser.createStrategy());


passport.serializeUser(NewUser.serializeUser());
passport.deserializeUser(NewUser.deserializeUser());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    NewUser.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/",(req,res)=>{
  res.render("home");
});

app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get("/auth/google/secrets",
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/secrets');
  })

app.get("/login",(req,res)=>{
  res.render("login");
});


app.get("/register",(req,res)=>{
  res.render("register");
})


app.get("/secrets",(req,res)=>{
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
})

app.post("/register",(req,res)=>{
    NewUser.register({username:req.body.username},req.body.password,(err,user)=>{
      if(err){
        console.log(err);
        res.redirect("/register")
      }else{
        passport.authenticate("local")(req,res,()=>{
          res.redirect("/secrets")
        })
      }
    })
})

app.post("/login",(req,res)=>{
   const user= new NewUser({
     username:req.body.username,
     password:req.body.password
   })

   req.login(user,(err)=>{
     if (err) {
       console.log(err);

     }else{
       passport.authenticate("local")(req,res,()=>{
         res.redirect("/secrets");
       })
     }
   })
})

app.get("/logout",(req,res)=>{
  req.logout((err)=>{
    if(!err){
        res.render("home");
    }
  });

})


app.listen(3000,()=>{
  console.log("running on 3000");
});
