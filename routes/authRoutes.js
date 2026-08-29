import express from "express";
import {register,updateProfile, verifyUser,resendOTP,updateUserPassword,login,deleteUserAccount,getMe,forgotPassword,verifyResetPassword, setNewPassword} from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddlewares.js";
import {upload} from "../config/cloudinary.js"

const router = express.Router();


router.post('/signup',upload.single('image'), register);
router.post('/verify-email', verifyUser);
router.post('/resend-otp', resendOTP);
router.patch('/profile', authMiddleware, upload.single('image'), updateProfile);
router.patch('/update-password',authMiddleware, updateUserPassword);
router.delete('/delete-account', authMiddleware, deleteUserAccount);
router.get('/me', authMiddleware, getMe)
router.post("/login", login);
router.post('/forgot-password',forgotPassword)
router.post('/verify-reset-password', verifyResetPassword);
router.post('/new-password', setNewPassword)


export default router;