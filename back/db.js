import mongoose from 'mongoose';


export const dbcoonecton = async () => {
   try {
        await mongoose.connect(process.env.mongo_uri , {
            dbName:"Sahyog"
        });
        console.log("Database connected successfully");
   } catch (error) {
    console.error("Database connection failed:", error);
   }
}   