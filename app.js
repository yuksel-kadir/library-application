//Import Libraries
const express = require("express");
const path = require("path");
const mongoose = require('mongoose');
const fileUpload = require("express-fileupload");
const bookUser = require("./models/bookUser");
const { createWorker } = require("tesseract.js");

//const worker = createWorker();
const app = express();
//Map global promise - get rid of warning
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://locaLhost:27017/library", {
	useNewUrlParser: true
});
const PORT = process.env.PORT || 5000;
const address = path.join(__dirname, "public/");

mongoose.connection
	.once('open', () => console.log('Connected to the library database'))
	.on('error', (error) => {
		console.log("SOMETHING WENT WRONG! : ", error);
	})


//app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.urlencoded({extended:false}));
app.use(fileUpload());

//req = request, res = response
app.get('/admin', (req, res) =>{
	res.sendFile(address + 'admin.html');
});

app.get('/user', (req, res) =>{
	res.sendFile(address + 'user.html');
});

app.post('/user', (req, res) => {
	let image = req.files.isbnImage.data;
	let number = getTextFromImage(image)
	.then((text) => {
		console.log(text);
	})
	.catch(err => {
		console.log("SOMETHING WENT WRONG WHILE READING ISBN NUMBER!: " + err);
	});
	res.json("helal bacanak");
});

app.post('/admin', (req, res) => {
	//Book name is stored in the bookname variable. Book's ISBN image is stored in bookImage object.
	let bookName = req.body.bookname;
	let imageFile = req.files.bookImage;
	let imageAddress  = './isbnPictures/'+ bookName +".jpeg";
	let isbn;
	console.log("Name of the image file: "+imageFile.name);
	console.log("Image object: " + imageFile);
	console.log("Name of the book: " + bookName);
	//console.log(req.body);
	//console.log(req.files);
	
	imageFile.mv(imageAddress, function(error){
		if(error){
			console.log("Couldn't upload the isbn image file.");
			console.log(error);
		}else{
			console.log("Image file successfully uploaded!");
			//Recognizing a text from an image takes time. So we have to wait to recognize the ISBN before we add book information to the database.
			getTextFromImage(imageAddress)
			.then((text) => {
				console.log(text);
				isbn = text;
				console.log("UPLOADING ISBN NUMBER: " + isbn);
				addBookInfo(isbn, bookName);
			})
			 .catch(err => {
				 console.log("SOMETHING WENT WRONG WHILE READING ISBN NUMBER!: " + err);
			 });
			//console.log("222222222UPLOADING ISBN NUMBER: " + isbn);
			//addBookInfo(isbnNumber, bookName);
		}
	});
	res.redirect("/admin");
});

app.listen(PORT, ()=> console.log(`Server started on port ${PORT}`));

async function getTextFromImage(address) {
	const worker = createWorker();
	await worker.load()
	await worker.loadLanguage('eng')
	await worker.initialize('eng')
  
	const { data: { text } } = await worker.recognize(address);
	//Parsing the text
    let temporaryText = text.split("\n")[0];
	let text2 = temporaryText.replace("ISBN ","");
	temporaryText = text2.replace(/-/g,"");
	await worker.terminate()
  
	return temporaryText;
  }

function addBookInfo(number, name){
	const uploadingPostedData = new bookUser({
		"isbnNumber" : number,
		"fileName" : name
	});
	uploadingPostedData.save()
		.then(
			data => {
				console.log(data);
			})
		.catch(err => {
			console.log("SOMETHING WENT WRONG WHILE UPLOADING DATA TO THE DATABASE!: " + err);
		});
}
