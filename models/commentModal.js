import mongoose from "mongoose";

//comment schema

const commentSchema = new mongoose.Schema({
    poll: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Poll",
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true

    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
    },
    text: {
        type: String,
        required: true,
        trim: true
    },

},{
    timestamps: true
});

commentSchema.index({ poll: 1 });
commentSchema.index({ user: 1 });
commentSchema.index({ parent: 1 });

export default mongoose.model("Comment", commentSchema);