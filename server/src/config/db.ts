import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL || 'mongodb_url', {
            serverSelectionTimeoutMS: 5000
        })
        console.log("MongoDB connected successfully.")
    }
    catch(error) {
        console.log(error)
        process.exit(1)
    }
};

export default connectDB;