const expFun=require('express');
const app=expFun();
const bodyParser=require('body-parser');
const dataBase=require('./database/mainDb')
app.set('view engine','ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/',(req,res)=>{
    res.render('login',{
        error:""
    })
})
let logedUserEmail;
let matchedData;


//connecting to mainDb
//when submitting Login
app.post('/loginsubmit',async(req,res)=>{    
    const username=req.body.username;//User entered Name
    const userEmail=req.body.useremail//User entered email
    const userPassword=req.body.userpassword//User entered password
    // we connecting to main database, it return module 
    const userModel=dataBase.mainDb();
    //checking is there any one already present or not 
    let  existingUser=await userModel.findOne({email:userEmail});    
    //login
    if(existingUser!=null)
    {
        //checking email and password
        if(existingUser.userName==username && existingUser.password==userPassword)
            {                
                //storing curent loged user email
                logedUserEmail=userEmail;
                console.log("All correct");
                res.render('home',{
                    name:existingUser.userName,
                    data:existingUser.userData  
                        })
            } 
        else {
            console.log("User details wrong");
            res.render('login',{
                error:"check Password"
             })
        }
    }
    //sign in 
    else
    {
        //creating user 
        existingUser=await userModel.create({
            userName:username,
            email:userEmail,
            password:userPassword,
            userData:[]
        })
        //storing curent loged user email
        logedUserEmail=userEmail;
        //again connecting to db because if we need  added userdata 
        res.render('home',{
            name:existingUser.userName,
            data:existingUser.userData  
          })
    }   
})
//createNewAmountContainer
//here we need to create NEW amount container
app.post('/createNewAmountContainer',async(req,res)=>{
    //getting database for creatinng new user userData(Amount adding) 
    const {amountContainerName,amountContainer}=req.body;
    //connecting to database Because if changes may happened
    const db=await dataBase.mainDb();
    //getting user all details
    let user=await  db.findOne({email:logedUserEmail})
    // Updating User User data====>Creating their new amount Container 
    const userName=user.userName;
    const userData=user.userData
    console.log(userName);
    let isUpdate=true;
    userData.forEach((e)=>{
        //place to check wheather entered n ame is already present or not
        if(e.containerName==amountContainerName)isUpdate=false;
    })
    if(isUpdate)
    {//only true if name not present
        await db.updateOne(
            {userName:userName },
            {$push: { userData: {
                    containerName:amountContainerName,
                    totalAmount:parseInt(amountContainer),
                    remainingAmount:parseInt(amountContainer),
                    expenses:0,
                    expensesList:[]
            }}}
          );
        
    }
        user=await  db.findOne({email:logedUserEmail});
        console.log(user)
              res.render('home',{
                name:user.userName,
                data:user.userData  
              })
    
    //inserting a new Amount Container into userContainer
    //before creating i need to check is there any other containerName exisisting

})
//pages of displaying our respective userData document
app.post('/amount',async(req,res)=>{
    //returning their respective clicked Userdata document
     //returning their respective clicked Userdata document
     //connecting to database Because if changes may happened
     const db=await dataBase.mainDb();
     //getting user all details 
     let user=await  db.findOne({email:logedUserEmail}); 
        user.userData.forEach((item)=>{
            //checking with containerName 
            if(item.containerName==req.body.containerName)
            {// name matched 
                matchedData=item;
            }
        })
        res.render('amount',{
            name:user.userName,
            containerName:matchedData.containerName,
            totalAmount:matchedData.totalAmount,
            remainingAmount:matchedData.remainingAmount,
            expenses:matchedData.expenses,
            expensesList:matchedData.expensesList,
            
        })
})

//when submitting input
//place of updating their userData
app.post('/value',async(req,res)=>{    
    // //updating Amount container 
    const amountEntered=parseInt(req.body.amount);
    const db = await dataBase.mainDb();
// getting user all details
let user = await db.findOne({ email: logedUserEmail }); 
user.userData.forEach((item)=>{
    //checking with containerName 
    if(item.containerName==req.body.containerName)
    {// name matched 
        matchedData=item;
    }
})
let count = -1;
user.userData.forEach(() => {
    count++;
});
// Document place that needs to be updated
containerName = user.userData[count - 1];
if((matchedData.remainingAmount-amountEntered)<0)
{//if entered amount  over total amount
    console.log("overflow");
}
else
{//if entered amount not over total amount
    let remainingAmountreplacer=matchedData.remainingAmount-amountEntered;
    let expensesAmountreplacer=matchedData.expenses+amountEntered;
    // Update the document where `email` matches the logged user
    //updating amount
    await db.updateOne(
        { email: logedUserEmail, "userData.containerName": matchedData.containerName }, 
        {
            $set: {
                "userData.$.remainingAmount":remainingAmountreplacer,
                "userData.$.expenses":expensesAmountreplacer,
            }
        }
    );
    //updating expenses list
    await db.updateOne(
        { email: logedUserEmail, "userData.containerName": matchedData.containerName }, 
        {
            $push: {
                "userData.$.expensesList":{
                    expenseName:req.body.expensename,
                    expensesAmount:expensesAmountreplacer
                }
            }
        }
    );
}
const  existingUser=await db.findOne({email:logedUserEmail});    

res.render('home',{
    name:existingUser.userName,
    data:existingUser.userData,
  })
    
})

app.use('/',(req,res)=>{
    res.send("404")
})
app.listen(3000,console.log("Running on port 3000"));
