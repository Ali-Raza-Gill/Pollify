import mongoose from "mongoose";
export function getDbStatus() {
  return mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
}