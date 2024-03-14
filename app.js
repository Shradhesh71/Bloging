require("dotenv").config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cookiePaser = require("cookie-parser");
const {
    checkForAuthenticationCookie,
  } = require("./middlewares/authentication");

const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");

const Blog = require('./models/blog');

const app = express();
const PORT =  7000;
// const PORT = process.env.PORT || 7000;

mongoose.connect(process.env.MONGO_URL)
.then(()=>{
    console.warn("connect...");
});

app.set("view engine", "ejs");
app.set("views",path.resolve("./views"));

app.use(express.urlencoded({extended: false}));
app.use(cookiePaser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));


// .sort("createdAt",-1)
app.get("/",async (req, res) => {
    const allblog = await Blog.find({});
    res.render("home",{
        user: req.user,
        blogs: allblog,
    });
});

app.use("/user", userRoute);
app.use("/blog",blogRoute);

app.listen(PORT, () =>{
    console.log(`listening on ${PORT}`);
});