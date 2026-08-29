import mongoose from "mongoose";

//vote schema
const voteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
},{
    timestamps: true,
    _id:false,
});

//poll schema
const pollSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    question: {
        type: String,
        required: true
    },
    type:{
        type: String,
        enum: ['single', 'yesno','rating','image','open'],
        required: true
    },
    options: [{
        type: String,
        image: String,
    }],
    category:{
        type: String,
        // enum: ['general', 'politics', 'sports', 'entertainment', 'technology', 'health', 'education', 'business', 'travel', 'food', 'fashion', 'science', 'music', 'art', 'history'],
        default: 'General', trim: true
    },
    closed: {
        type: Boolean,
        default: false
    },
    views: {
        type: Number,
        default: 0
    },
    votes: [voteSchema],
},{
    timestamps: true,
    _id:false,
},{
    timestamps: true
});

const Poll = mongoose.model("Poll", pollSchema);

export default Poll;
