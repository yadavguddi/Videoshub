const mongoose = require("mongoose");
const Schema = mongoose.Schema; 
const Comment = require("./comment.js");
let User = require("./user.js")

const dataSchema = new Schema({
    videoId: String,
    title: String,
    description: String, 
    channelTitle:String,
    comments:[
        {
            type:Schema.Types.ObjectId,
            ref:"Comment"
        }
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
            }
});

dataSchema.post("findOneAndDelete", async (doc) => {
    try {
        if (doc) {
            await Comment.deleteMany({ _id: { $in: doc.comments } });
        }
    } catch (error) {
        console.error("Error deleting comments:", error);
    }
});



// Use mongoose.model to create the model
const YoutubeData = mongoose.model("YoutubeData", dataSchema);

module.exports = YoutubeData; // Export the model
