const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const usersSchema = new Schema({
    mode:{type:String, trim:true, required:true},
    username:{type:String, trim:true, default:"username", required:true},
    password:{type:String, trim:true, default:"password", required:true},
});

const users = mongoose.model('users', usersSchema);

module.exports = users;
