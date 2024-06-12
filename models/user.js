const mongoose = require("mongoose")
const { Schema } = mongoose;

const UserSchema =  new Schema({
    name : {
        type: String,
        required : true
    },
    age : {
        type : Number,
        required : true
    },
    email : {
        type: String
    },
    mobile : {
        type : String
    },
    address : {
        type : String,
        required : true
    },
    aadharcard : {
        type : Number,
        required : true,
        unique : true
    },
    password : {
        type: String,
        required : true
    },
    role : {
        type : String,
        enum : ['voter','admin'],
        default : 'voter'
    },
    isVoted : {
        type : Boolean,
        default : false
    }
})

module.exports = mongoose.model('Voter',UserSchema)