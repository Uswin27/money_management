const db=require('mongoose');

//schema for all users to create thier details
let userSchema=db.Schema({
        userName:String,
        email:String,
        password:Number,
        userData:[]
    })
//database connection functions
    // db.connect("mongodb://127.0.0.1:27017/data")
    // .then(() => console.log("Connected to Main MongoDB"))
    // .catch(err => console.error("Error connecting to MongoDB:", err));

//1.Connection to main which is userDetails
function mainDb()
{
    
    db.connect("mongodb://127.0.0.1:27017/data")
    .then(console.log("Connected to database"))
    .catch((err)=>console.log("Err Connecting to database",err))
    const userModel=db.model('name',userSchema);
    return userModel; 
}


module.exports=
{
    mainDb
}