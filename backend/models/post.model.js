import mongoose from "mongoose";

const postSchema = new mongoose.Schema({

    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:true
    },
    text:{
        type:String,
    },
    img:{
        type:String,
    },
    audio: { 
        type: String,
    },
    likes:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
    comments:[
        {
            text:{
                type:String,
                required:true
            },
            user:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required:true
            }
        }
    ],
    originalPost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
    },
    repost:{
        type: Boolean,
        default:false
    }

},{timestamps:true})



const Post = mongoose.model("Post",postSchema)

export default Post

