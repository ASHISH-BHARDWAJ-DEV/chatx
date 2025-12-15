import mongoose from "mongoose";
// import { ENV } from "./env.js";

export const connectDB = async () => {
  try {
    const con = await mongoose.connect(process.env.MONGO_URI);
    
    console.log("mongodb connected:", con.connection.host);
  } catch (error) {
    console.error("Error connecting mongodb", error);
    process.exit(1);
  }
};
