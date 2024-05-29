const express = require("express");
const router = express.Router({mergeParams:true});
const Comment = require("../models/comment.js")
const YoutubeData = require("../models/youtubedata.js");
const axios = require("axios");
const User = require("../models/user.js");
const {isLoggedIn} = require("../middleware.js")
//comments
router.post("/", isLoggedIn,async(req,res) =>

    {
        console.log(req.user);
            let {id} = req.params;
            let youtubeData= await YoutubeData.findById(id).populate({path:"comments",populate :{
                path:"author"
            }});
            let {rating,comment} = req.body
            console.log(rating,comment)
            let comments = new Comment({
             rating: req.body.rating,
             comment: req.body.comment,
             
            
         });
         comments.author =req.user;
         let commentUser=comments.author.username;
         console.log(commentUser)
        //  console.log(youtubeData);
         youtubeData.comments.push(comments)
         await comments.save();
         await youtubeData.save();
         console.log("new review saved");
         req.flash("success","New comment Added!")
         res.redirect(`/video/${id}`);
   
    })
    
    //comments delete route

    router.delete("/:commentId",isLoggedIn,async(req,res) =>{
    
    let {id,commentId} = req.params;
    await YoutubeData.findByIdAndUpdate(id,{$pull:{comments:commentId}})
    let deletedComment = await Comment.findByIdAndDelete(commentId);
    req.flash("error","Your Comment Deleted!")
    res.redirect(`/video/${id}`);
        
    })

    module.exports = router;