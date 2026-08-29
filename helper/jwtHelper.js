import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  console.log("Generating access token for user:", user); // Debugging line
  const token = jwt.sign(
    {
      userId: user.userId,
      email: user.email,
      role: user.role || "user",
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m" },
  );
  console.log("Generated access token:", token); // Debugging line
   console.log("DECODED TOKEN:", jwt.decode(token));
  return token;
};

export const generateRefreshToken = (user) => {
  return jwt.sign({ userId: user.userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || "30d",
  });
};

export const verifyAccessToken = (token) => {
  console.log("this is the jwt",jwt.verify(token, process.env.JWT_ACCESS_SECRET));
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};
