import express from 'express';
import 'dotenv/config'
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import validator from 'validator';
import signupModel from '../models/signupmodel.js';


//lets create a new function to generate a token
//create Token
//so we have used user id as a data to generate jwt token.

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}

const signupUserFunc = async (req, res) => {
    const { name, password, email } = req.body;
    try {
        //checking if user already exists
        const exists = await signupModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User Already Exists" })


        }
        //validating email format and strong password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please Enter Valid Email" })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please Enter Strong Password" })


        }
        //valid user
        //hashing user password
        const salt = await bcrypt.genSalt(10);


        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new signupModel({
            name: name,
            email: email,
            password: hashedPassword,
        });

        const user = await newUser.save();
        // saved the user into the database ,and saved that new user reference into the variable ‘user’.


        const token = createToken(user._id);
        res.status(200).json({ success: true, token })


    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }


}

const loginUserFunc=async(req,res)=>{
    const {email,password}=req.body;
    console.log(req.body)
    try{
        console.log('try block entered')
        //checking if user already exists with this email.
        const user=await signupModel.find({email});
        console.log(user)
        if(user.length==0){
            console.log('user doesnt exits if block');
            res.json({success:false,message:"User Doesnt Exists"});
        }
        console.log('im outside if block')
        //in comparing  - we will give 2 parameters - user entered password and the monogodb already stored user password - user.password.
        console.log(password);
        console.log(typeof(password))
        console.log(typeof(user[0].password))
        console.log(user[0].password);
        const isMatch= await bcrypt.compare(password,user[0].password);
        console.log(isMatch)
        if(!isMatch){
           return  res.json({success:false,message:"Invalid Credentials"})
        }


        const token=createToken(user._id);
        
        res.json({success:true,token})
    }
    catch(error){
        console.log(error);
        res.json({success:false,message:"Error"})
    }



}
const authmiddleware=async (req,res,next)=>
    {
        console.log('im a middleware')
    const {token}=req.headers;
    console.log("req.headers is:")
    console.log(req.headers)
    if(!token){

        res.json({success:false,message:"Not Authorized User"})
    }
    try{
        //decoding token - and verifying
        console.log(`decoding ${token}`);
        const token_decode=jwt.verify(token,process.env.JWT_SECRET);
        req.body.userId=token_decode.id;
        next()
       
    }
    catch(error){
        console.log(error);
        res.json({success:false,message:"Error"})


    }

}

const addTocart=async(req,res)=>{
    console.log('added to cart');
    res.json({success:true,message:"added to cart successfully"})

}



export { signupUserFunc ,loginUserFunc,authmiddleware,addTocart}