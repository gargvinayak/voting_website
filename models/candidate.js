const mongoose = require("mongoose")
const { Schema } = mongoose;

const candidateSchema =  new Schema({
    name : {
        type: String,
        required : true
    },
    age : {
        type : Number,
        required : true
    },
    party : {
        type : String,
        required : true
    },
    votes : [
        {
            user : {
                type : mongoose.Schema.Types.ObjectId,
                ref : 'User',
                required : true
            },
            votedAt : {
                type : Date,
                default : Date.now()
            }
        }
    ],

    voteCount : {
        type : Number,
        default :  0
    }
    
})

module.exports = mongoose.model('Candidate',candidateSchema)