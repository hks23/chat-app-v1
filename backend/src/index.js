import express from 'express';

import dotenv from 'dotenv';
import { connectDB } from './lib/db.js';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); //this line is required to parse the request body
app.use(cookieParser()); //this line is required to parse the cookie

app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes); //this line is required to use the message routes
app.listen(3000, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});