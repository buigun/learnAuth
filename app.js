require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption")
// const md5 = require("md5")
// const bcrypt = require("bcrypt");
// const salt = 10;
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const port = 3000;

app.set("view engine","ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));

app.use(session({
    secret: "Our litle secret.",
    resave: false,
    saveUninitialized: false,
    cookie: {}
}));

app.use(passport.initialize());
app.use(passport.session());

///Database Model///
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Email must be filled"]
    },
    password: {
        type: String
    }
});

// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

//passport initialize
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req,res)=>{
    res.render("home");
});

app.route("/login")

.get((req,res)=>{
    res.render("login");
})

.post((req,res)=>{
    const {username,password} = req.body;

    const user = new User({
        username,
        password
    })

    req.login(user, (err)=>{
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            })
        }
    })
})

app.get("/secrets", (req,res)=>{
    if (req.isAuthenticated()){
        res.render("secrets")
        console.log(req.user);
    } else {
        res.redirect("/login")
        console.log(req.user);
    }
})

app.route("/register")

.get((req,res)=>{
    res.render("register");
})

.post((req,res)=>{
    User.register({username: req.body.username},req.body.password,(err, user)=>{
        if (err){
            console.log(err);
            res.redirect("/register")
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            })
        }
    })
})

app.get("/logout", (req,res)=>{
    req.logout();
    res.redirect("/")
})

app.get("/checkAuthentication", (req, res) => {
    console.log(req.user);
    const authenticated = req.user ? true : false
  
    res.status(200).json({
      authenticated,
    });
});

app.listen(port, ()=>{
    console.log("This server is running on port",port);
});