import express from 'express';
import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
import Bottleneck from 'bottleneck';
import dotenv from 'dotenv';
import ConnectDB from './db/connection.js';
import cors from 'cors';
import { getDbStatus } from './utils/dbStatus.js';
import morgan from 'morgan';
import routes from "./routes/index.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(morgan("dev"))

app.set('view engine', 'ejs');

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Sirf is URL ko allow karega (e.g., React default port)
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Jo HTTP methods aap allow karna chahte hain
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  credentials: true, // Agar cookies ya auth headers bhejne hain
};
app.use(cors(corsOptions));

// 1. NOT User-Specific (Tracks by IP address)
const ipLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 100, // 100 requests per IP address
  message: "Too many requests from this device. Please try again later"
});

// 2. USER-SPECIFIC (Tracks by User ID from a login token)
const userSpecificLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // Max 20 requests per logged-in user account
  
  // This function tells Express how to identify the user uniquely
  keyGenerator: (req, res) => {
    // If user is logged in, use their unique database ID, otherwise fallback to IP
    keyGenerator: (req, res) => {
    // IPv6 security validation ke liye ye helper call karna zaroori hai
    return ipKeyGenerator(req, res); 
  }
  },
  message: "Account limit exceeded. You are making too many requests!"
});

// 3. Bottleneck
const limiter = new Bottleneck({
  maxConcurrent: 5,
  minTime: 200
});

app.use("/api/v1", routes);

// 2. Base route where server is running (http://localhost:3000/)
app.get('/', (req, res) => {
  const data = {
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + 'Z',
    db: getDbStatus(),
  };
  // render the EJS template with the data
  res.render('status', data);
});



ConnectDB();
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});