const express = require('express')
const app = express();
const port = 3000;
require('dotenv').config();
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
app.set('view engine','ejs')
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// console.log(process.env.MONGODB_URI)

async function main() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`database connected ${process.env.MONGODB_URI} `)
  }

  main().catch(err => console.log(err))

  app.use('/', require('./routes/userRoutes'))
  app.use('/admin', require('./routes/candidateRoutes'))



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })