import mongoose from "mongoose";

const mongoDB = async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("db connected");
        
    }catch(error){
        console.error("mongo Error" , error);
        process.exit(1);
    }
}


export default mongoDB;