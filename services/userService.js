import User from "../models/userModel.js";
import { hashPassword } from "../helper/hashHelper.js";
import { conflict } from "../helper/responseHandler.js";

export const createUser = async(userData,res) => {
    const existingUser = await User.findOne({email:userData?.email})
    if(existingUser) return conflict(res,"Email already exist!")
    
    if(userData.password){
        userData.password = await hashPassword(userData.password)
    }

    const user = await User.create(userData)
    const safeUser  = user.toObject();
    delete safeUser.password; // removed password from response
    return safeUser;
}