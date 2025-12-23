import dotenv from "dotenv"
dotenv.config({
    path : "./.env"
})

import app from "./app.js"
import connectDB from "./db/db.js"
const port = process.env.PORT ?? 3000;

connectDB().
then(()=>{
    app.listen(port, ()=>{
        console.log("DB connected and app ran  on port:" + port );
    });
}).
catch((err)=>{
    console.log("Error", err)
})





