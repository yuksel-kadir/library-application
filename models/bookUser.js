const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const bookUserSchema = new Schema({
    //user _id
    //_id:{type:mongoose.ObjectId,required:true},
    books:[
        {
            bookIsbn:{type:String, trim:true, default:0},
            bookname:{type:String},
            //Date
            bookDate:{type:Date},
            returnDate:{type:Date}
        }
    ]
});

const bookUser = mongoose.model("bookUser", bookUserSchema);

module.exports = bookUser;