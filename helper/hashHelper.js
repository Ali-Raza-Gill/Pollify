import bcrypt from "bcrypt";

// 1. Hashing a password (during User Registration)
export async function hashPassword(plainPassword) {
  const saltRounds = 12; // Recommended cost factor (2^12 iterations)
  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
  return hashedPassword; // Safe to save to MongoDB/SQL database
}

// 2. Verifying a password (during User Login)
export async function verifyPassword(plainPassword, storedHash) {
  const isMatch = await bcrypt.compare(plainPassword, storedHash);
  return isMatch; // Returns true if valid, false otherwise
}