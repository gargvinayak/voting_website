const express  = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Voter = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
require('dotenv').config();
const Candidate = require('../models/candidate')
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const ejsFilePath = path.join(__dirname, 'invoice.ejs');

const sendEmailWithInvoice = async (recipient, cname, date, party) => {
    // Render EJS template
    const htmlContent = await ejs.renderFile(ejsFilePath, { cname, date, party });
  
    // Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // e.g., 'gmail'
      auth: {
        user: 'gargvinayak444@gmail.com',
        pass: 'jtocdestnbuvtvse'
      }
    });
  
    // Define email options
    const mailOptions = {
      from: 'gargvinayak444@gmail.com',
      to: recipient,
      subject: 'Invoice',
      html: htmlContent
    };
  
    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error occurred while sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });
  };


router.get('/', async (req,res) =>{
    const token =  await req.cookies.token
    
    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET) 
        const data = await Voter.findOne({_id : decoded.id});
        const role = data.role
        const candidates = await Candidate.find({})
        if(role==="admin"){
            res.redirect('/admin/')
        }
        else{

            res.render('index',{candidates})
        }
        
    } catch (error) {
     res.redirect('/login')
    }

 })

 router.get('/profile', async (req,res) =>{
    const token =  await req.cookies.token;
    // console.log(token)
    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET) 
        const data = await Voter.findOne({_id : decoded.id});
        const {name,age,email,aadharcard,address,mobile} = data
        res.render('profile', {name,age,email,aadharcard,address,mobile})
        
    } catch (error) {
       res.status(401).json("Invalid Token") 
    }

 })

 router.put('/profile/password', async (req,res) => {
    const istoken = req.headers.authorization
    if(!istoken) return res.status(401).json("Token not found")
    const token =  istoken.split(' ')[1]
    
    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET) 
        
        const salt = bcrypt.genSaltSync(10);
        const secpass = await bcrypt.hash(req.body.password,salt)

         await Voter.updateOne({_id : decoded.id}, { $set : {
          password : secpass
        }});
        res.json("Password updated")
        
    } catch (error) {
       res.status(401).json("Invalid Token") 
    }
 })


 router.post("/signup", async (req,res) => {
    const aadharnumber = req.body.aadharcard
   // console.log(aadharnumber)
    const person = await Voter.findOne({aadharcard : aadharnumber})
    if(person){
        res.json('User already exists')
        console.log(person)
        return;
    }
    const salt = bcrypt.genSaltSync(10);
    const secpass = await bcrypt.hash(req.body.password,salt)
   try {
    const newUser = new Voter ({
        name : req.body.name,
        age : req.body.age,
        address : req.body.address,
        aadharcard : req.body.aadharcard,
        mobile : req.body.mobile,
        email : req.body.email,

        password : secpass
    })
    await newUser.save()
    const payload = {
        id : newUser._id
    }
    const token = jwt.sign(payload,process.env.JWT_SECRET)
    // console.log(token)

    res.redirect('/login')
    

   } catch (error) {
    res.status(401).send(error)
   } 
})

router.get('/signup',(req,res) =>{
    res.render('signup')
} )

router.get('/login',(req,res) =>{
    res.render('login')
} )

router.get('/vote/:id', async (req,res) =>{
    const token =  await req.cookies.token;
    try{
    const decoded = jwt.verify(token,process.env.JWT_SECRET)
    const chosen = await Candidate.findOne({_id : req.params.id})
    const data = await Voter.findOne({_id : decoded.id});
    if(data.isVoted){
     res.send("You have already Voted")
     return ;
    }
    await Candidate.updateOne({_id : req.params.id}, { $set : {
        voteCount : chosen.voteCount+1
      }});
      
      await Voter.updateOne({_id : decoded.id}, { $set : {
        isVoted : true
      }});

      const recipient = data.email;
      const cname = chosen.name;
      const date = Date.now();
      const party = chosen.party;
      sendEmailWithInvoice(recipient, cname, date, party);
      
      // console.log(chosen)
    res.redirect('/') }
    catch{
        res.status(401).send(error)
    }
} )



router.post("/login", async (req,res) => {
    const aadharnumber = req.body.aadharcard
    const person = await Voter.findOne({aadharcard : aadharnumber})
    if(!person){
        res.json('User Does not exists')
        // console.log(person)
        return;
    }
    const passcompare = await bcrypt.compare(req.body.password,person.password)
    if(!passcompare) return res.send("The password do not match")

   try {
    
    const payload = {
        id : person._id
    }
    const token = jwt.sign(payload,process.env.JWT_SECRET)
    res.cookie('token', token, {
        httpOnly: true, // Cookie accessible only by the server
        secure: false, 
    });
   // console.log(token)
    res.redirect('/')

   } catch (error) {
    res.status(401).send(error)
   } 
})





 module.exports = router