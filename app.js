const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const axios = require("axios");
const YoutubeData = require("./models/youtubedata.js");
const Comment = require("./models/comment.js")
const videoRouter = require("./routes/video.js")
const commentRouter =require("./routes/comments.js")
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js")
const userRouter =require("./routes/user.js")
const app = express();
const port = 2000;

// Set EJS as the view engine
app.set("view engine","ejs");
app.set("views",path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate)
app.use(express.static(path.join(__dirname,"/public")));
const sessionOptions = {
    secret:"mysupersecrectcode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 *1000,
        maxAge:7 * 24 * 60 * 60 *1000,
        httpOnly:true,
    }
};

app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// app.get("/demouser" ,async(req,res) =>{
//     let user = new User({
//         email :"person1@gmail.com",
//         username:"person123",
//     });

//    let regertereduser=await  User.register(user,"person123");
//    res.send(regertereduser);
// });


app.use((req,res,next) =>{
 res.locals.success= req.flash("success");
 res.locals.error= req.flash("error");
 res.locals.currUser = req.user;
 next();
})

app.use(async (req, res, next) => {
    try {
        const users = await User.find(); // Fetch all users from the database
        res.locals.users = users; // Store users in res.locals
        next();
    } catch (err) {
        console.error("Error fetching users:", err);
        next(err); // Pass the error to the next middleware
    }
});


async function main() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/youtubesource');
        console.log("Connected to DB successfully");
    } catch (err) {
        console.log("Failed to connect to database", err);
    }
}

main();

let apiKey = "AIzaSyD-sA3O7KfEspn2mikI54cL0p7UTCgOccI";



// // Call the sourceId function with the URL
// let url = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=codewithharry&type=video&maxResults=20&key=${apiKey}`;
// // sourceId(url);

app.use("/video",videoRouter);
app.use("/video/:id/comments",commentRouter)
app.use("/",userRouter);

app.get('/search', async (req, res) => {
    try {
        const searchQuery = req.query.query;
        console.log(searchQuery);
        await YoutubeData.deleteMany({});

        let url = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=20&key=${apiKey}`;
        
        // Fetch data from YouTube API
        let response = await axios.get(url);
        let videoItems = response.data.items;
        
        // Initialize an array to store the current search operation data
        let savedVideoData = [];  
        
        // Loop through each video item
        for (let videoItem of videoItems) {
            let videoId = videoItem.id.videoId;
            let title = videoItem.snippet.title;
            let channelTitle = videoItem.snippet.channelTitle;
            let description = videoItem.snippet.description;

            // Create a new instance of YoutubeData model
            let newData = new YoutubeData({
                videoId: videoId,
                title: title,
                channelTitle: channelTitle,
                description: description,
            });
            
            // Save the data to MongoDB
            let savedData = await newData.save();
            // Add the video data to the savedVideoData array
            savedVideoData.push(savedData);
        }
        
        // Render the view with the data obtained from the current search operation
        res.render("video.ejs", { datas: savedVideoData });
    } catch (error) {
        console.error("Failed to process search query:", error);
        res.status(500).json({ success: false, error: "Failed to process search query" });
    }
});



app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
