import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    userName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
      },
    password: {
      type: String,
      required: true,
      minlength: 6,
      trim: true
    },
    avatar: {
        url:{
          type: String,
          default:''
        },
        publicId:{
          type: String,
          default:'',
        }
    },
    bio: {
        type: String,
        default: '',
        maxlength: 160
    },
    bookmarks:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Poll'
    }],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: String,
    otpExpires: Date,
  },
  {
    timestamps: true
  }
);
const User = mongoose.model('User', userSchema);
export default User;