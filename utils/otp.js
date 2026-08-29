// Generate 6 digit OTP
export const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit OTP
  return otp.toString();
};

// OTP expiration time in milliseconds (e.g., 5 minutes)
export const otpExpiry = () => new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

// Validate OTP
export const validOTP = (user,otp)=>
    user.otp === otp 
&&  user.otpExpires 
&&  user.otpExpires > new Date();