const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const bookAdminSchema = new Schema({
   // _id:
   isbnNumber:{type:String, trim:true, default:0, required: true},
   fileName:{type:String, trime:true,default:"", required:true}
   //returnDate:{type:Date, trim:true, required:true}
}); 

const bookAdmin = mongoose.model('bookAdmin', bookAdminSchema);

module.exports = bookAdmin;

/*
const bookUserSchema = mongoose.Schema({
    userid:{type: Number, trim:true},
    isbnNumber:{type: String, trim:true,default:''},
    returnDate:{type: Date, trim:true,default:''}
});
 */
//module.exports = mongoose.model('bookUser', bookUserSchema);

