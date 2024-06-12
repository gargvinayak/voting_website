const express  = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Voter = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
require('dotenv').config();
const Candidate = require('../models/candidate')

router.get('/', async (req,res) =>{
    const token =  await req.cookies.token
    // res.render('admin')
    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET) 
        const data = await Voter.findOne({_id : decoded.id});
        const role = data.role
        const candidates = await Candidate.find({})
        if(!(role==="admin"))
            return res.status(401).json("You are not admin")
        
        res.render('admin',{candidates})
        
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
        const role = data.role

        if(!(role==="admin"))
            return res.status(401).json("You are not admin")

        const {name,age,email,aadharcard,address,mobile} = data

        res.render('profile', {name,age,email,aadharcard,address,mobile})
        
    } catch (error) {
       res.status(401).json("Invalid Token") 
    }

 })

 router.get('/add', async (req,res) =>{
    const token =  await req.cookies.token;
    // console.log(token)
    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET) 
        const data = await Voter.findOne({_id : decoded.id});
        const role = data.role

        if(!(role==="admin"))
            return res.status(401).json("You are not admin")

        res.render('add')
        
    } catch (error) {
       res.status(401).json("Invalid Token") 
    }

 })

 router.get('/result', async (req,res) =>{
    const token =  await req.cookies.token;
    // console.log(token)
    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET) 
        const data = await Voter.findOne({_id : decoded.id});
        const role = data.role
        const candidates = await Candidate.find({})
        if(!(role==="admin"))
            return res.status(401).json("You are not admin")

        res.render('result',{candidates})
        
    } catch (error) {
       res.status(401).json("Invalid Token") 
    }

 })

 router.post('/add', async (req,res) =>{
    
    // console.log(token)
    try {
       const newcandidate = new Candidate ({
        name : req.body.name,
        age : req.body.age,
        party : req.body.party
       })
        await newcandidate.save()
        res.redirect('/')
    } catch (error) {
       res.status(401).json("Internal servor error") 
    }

 })

 router.get('/candidate/:id', async (req,res) =>{
   const token =  await req.cookies.token;
   const data = await Candidate.findOne({_id : req.params.id})
    // console.log(token)
    try {
      const decoded = jwt.verify(token,process.env.JWT_SECRET) 
      const {name,age,party,_id} = data
      res.render('candidate',{name,age,party,_id})
   } catch (error) {
       res.status(401).json("Internal servor error") 
    }

 })

 router.post('/candidate/:id', async (req,res) =>{
    
     console.log(req.params.id)
     try {
        const data = await Candidate.deleteOne({_id : req.params.id})
        // console.log(data)
        res.redirect('/')
    } catch (error) {
       res.status(401).json("Internal servor error") 
      }
      
   })

   router.post('/candidate/update/:id', async (req,res) =>{
      
     // console.log(req.body)
      const data = await Candidate.findOne({_id : req.params.id})
  try {
   await Candidate.updateOne({_id : req.params.id}, { $set : {
      name : req.body.name,
      age : req.body.age,
      party : req.body.party
    }});
      // console.log(data)
      res.redirect('/')
  } catch (error) {
     res.status(401).json("Internal server error") 
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


 









 module.exports = router