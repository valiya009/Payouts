import mongoose from 'mongoose';


export const dbcoonecton = async () => {
   try {
        await mongoose.connect(process.env.MONGO_URI , {
            dbName:"Sahyog"
        });
        console.log("Database connected successfully");
   } catch (error) {
    console.error("Database connection failed:", error);
   }
}   