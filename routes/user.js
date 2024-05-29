const express = require("express");
const router = express.Router({mergeParams:true});
const User = require("../models/user.js");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js")

router.get("/signup",(req,res) =>{
    res.render("users/signup.ejs")
});

router.post("/signup", async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "You are successfully registered and logged in!");
            res.redirect("/video");
        });
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
});

router.get("/login",(req,res) =>{
    res.render("users/login.ejs")
});

router.post("/login",
saveRedirectUrl,
passport.authenticate(
    'local',{failureRedirect: '/login',failureFlash:true}
),async(req,res) =>{
    req.flash("success","You are loggedIn !");
    let redirectUrl = res.locals.redirectUrl || "/video"
    res.redirect("/video");
})

router.get("/logout",(req,res,next) =>{
    req.logout((err) =>{
        if(err){
            return next(err);
        }
        req.flash("success","You are logout now!");
        res.redirect("/video");
    })
})

module.exports = router;