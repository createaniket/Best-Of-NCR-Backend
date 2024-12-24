const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    name:{
        type:String
    },
    slug:{
        type:String,
    },
    image:{
        type:String
    },
    parent:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category"
    },
    Childrens:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Category"
        }
    ],
    isparent:{
        type:Boolean,
        default:false
    }
},

  {
    timestamps: true,
  })

module.exports = mongoose.model("Category", categorySchema)