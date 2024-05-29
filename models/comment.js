let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let model = mongoose.model;
let User = require("./user.js")

let commentSchema = new Schema({
    comment : {
        type:String,
    },
    rating :{
type:Number,
min:1,
max:5,
    },
    created_at:{
        type:Date,
        default:Date.now(),
    },
    author:{
        type:Schema.Types.ObjectId,
        ref:"User",
            }
  
})

module.exports = model("Comment", commentSchema)