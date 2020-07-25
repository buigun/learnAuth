require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption")
const port = 3000

app.set("view engine","ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));

///Database Model///
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true});

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email must be filled"]
    },
    password: {
        type: String,
        required: [true, "Password must be filled"]
    }
});

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

const User = new mongoose.model("User", userSchema);

app.get("/", (req,res)=>{
    res.render("home");
});

app.route("/login")

.get((req,res)=>{
    res.render("login");
})

.post((req,res)=>{
    const {email,password} = req.body;

    User.findOne({email},(err, result)=>{
        if(err){
            res.send(err);
        } else {
            if(!result) {
                res.send("email wrong")
            } else {
                if (result.password == password) {
                    res.render("secrets");
                } else {
                    res.send("password wrong");
                }
            }
        }
    })
})

app.route("/register")

.get((req,res)=>{
    res.render("register");
})

.post((req,res)=>{
    const {email,password} = req.body;
    const newUser = new User({
        email,
        password
    })

    newUser.save((err)=>{
        if (err) {
            res.send(err);
        } else {
            res.render("secrets");
        }
    })
})

app.listen(port, ()=>{
    console.log("This server is running on port",port);
});