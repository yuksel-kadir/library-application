//Import Libraries
const express = require("express");
const path = require("path");
const mongoose = require('mongoose');
const fileUpload = require("express-fileupload");
const bookAdmin = require("./models/bookAdmin");
const bookUser = require("./models/bookUser");
const users = require("./models/user");
const { createWorker } = require("tesseract.js");
let systemDate = new Date();

let loggedUser = {
	id: "",
	username: "",
	mode: "",
	logged :false,
	hasMoreThanThreeBooks:false,
	hasOutOfDateBook:false,
	someOneHasBook:false
}
let searchMode = 0; //0 = List All, 1 = Search By ISBN, 2 = Search By Book Owner
//const worker = createWorker();
const app = express();
//Map global promise - get rid of warning
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://locaLhost:27017/library", {
	useNewUrlParser: true,
	useUnifiedTopology: true
});
const PORT = process.env.PORT || 5000;
const address = path.join(__dirname, "public/");
console.log(address);
mongoose.connection
	.once('open', () => {
		console.log('Connected to the library database');
		console.log("DATE: " + systemDate.getDate() + " " + (systemDate.getMonth() + 1) + " " + systemDate.getFullYear());
	})
	.on('error', (error) => {
		console.log("SOMETHING WENT WRONG WHILE TRYING TO CONNECT TO THE DATABASE! : ", error);
	})


//app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.urlencoded({extended:false}));
app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.get('/getUsers', async(req, res) => {
	//Listing Users
	const ress = await bookUser.find();
	res.json(ress);
});

app.get('/', (req, res) => {z     
	if(loggedUser.mode == "admin"){
		res.redirect('/admin');
	}else if(loggedUser.mode == "user"){
		res.redirect('/user');
	}else if(loggedUser.mode == ""){
		res.redirect("/login");
	}
});

//req = request, res = response
app.get('/admin', (req, res) => {
	//					&& loggedUser.mode != admin
	if(loggedUser.logged != true){
		res.redirect("/login");
	}else if(loggedUser.mode != "admin"){
		res.redirect('/user');
	}
	else if(loggedUser.mode=="admin"){
		res.sendFile(address + 'admin.html');
	}
});

app.get('/getUserName', (req, res) => {
	res.json(loggedUser.username);
});

app.get('/user', (req, res) => {
	if(loggedUser.logged != true){
		res.redirect("/login");
	}else if(loggedUser.mode != "user"){
		res.redirect('/admin');
	}
	else if(loggedUser.mode == "user"){
		res.sendFile(address + 'user.html');
	}
		//res.sendFile(address + 'login.html');
});

app.get('/login', (req, res) => {
	res.sendFile(address + 'login.html');
});

app.post('/assignBook', async (req, res) => {
	let query = req.body.bookInfo;
	let obj = "";
	let result = "";
	console.log("QUERRRRRYYYYYY:" + query);
	let regex = /[A-Za-z]/g;
	const found = query.match(regex);
	//Checks if the string is a ISBN or a book name.
	if (found) {
		query = query.toLowerCase();
		console.log(query);
		const doc = await bookAdmin.find({ fileName: query }, async function (err, data) {
			if (err) {
				console.log("SOMETHING WENT WRONG WHILE SEARCHING FOR BOOK NAME!: ", err);
				res.json("error");
			} else if (data.length == 0) {
				console.log("COULDN'T FIND THE BOOK!");
				res.json(obj);
			} else {
				await searchBookOwners(data[0].isbnNumber);
				//assignBook(data[0].isbnNumber);
				console.log("YOU'VE SEARCHED FOR: " + query);
				console.log("Bookname: " + data[0].fileName + " ID: " + data[0]._id + " ISBN: " + data[0].isbnNumber);
				obj = {hasMoreThanThreeBooks:loggedUser.hasMoreThanThreeBooks, hasOutOfDateBook:loggedUser.hasOutOfDateBook,someOneHasBook:loggedUser.someOneHasBook}
				result = JSON.stringify(obj);
				res.json(obj);
			}
		});
	} else {
		const doc = await bookAdmin.find({ isbnNumber: query }, async function (err, data) {
			if (err) {
				console.log("SOMETHING WENT WRONG WHILE SEARCHING FOR ISBN!: ", err);
				res.json("error");
			} else if (data.length == 0) {
				console.log("COULDN'T FIND THE BOOK!");
				res.json(obj);
			} else {
				await searchBookOwners(data[0].isbnNumber);
				//assignBook(data[0].isbnNumber);
				console.log("YOU'VE SEARCHED FOR: " + query);
				console.log("Bookname: " + data[0].fileName + " ID: " + data[0]._id + " ISBN: " + data[0].isbnNumber);
				obj = {hasMoreThanThreeBooks:loggedUser.hasMoreThanThreeBooks, hasOutOfDateBook:loggedUser.hasOutOfDateBook,someOneHasBook:loggedUser.someOneHasBook}
				result = JSON.stringify(obj);
				res.json(obj);
			}
		});
	}
	resetUserBookSettings();
	//res.redirect('/user');
});

app.post('/setDate', (req, res) => {
	let day = parseInt(req.body.dayNumber);
	changeSystemDate(day);
	res.redirect('/admin');
});

app.post('/userSearch', async (req, res) => {

	let query = req.body.queryvar;
	console.log("QUERY:"+query);
	let regex = /[A-Za-z]/g;
	const found = query.match(regex);
	let obj = "";
	let result = "";
	//Checks if the string is a ISBN or a book name.
	if (found) {
		query = query.toLowerCase();
		const doc = await bookAdmin.find({ fileName: query }, function (err, data) {
			if (err) {
				console.log("SOMETHING WENT WRONG WHILE SEARCHING FOR BOOK NAME!: ", err);
			} else if (data.length == 0) {
				console.log("NO RECORD FOUND!");
			} else {
				console.log("YOU'VE SEARCHED FOR: " + query);
				console.log("Bookname: " + data[0].fileName + " ID: " + data[0]._id + " ISBN: " + data[0].isbnNumber);
				obj = {bookname:data[0].fileName, id:data[0]._id, isbn:data[0].isbnNumber}
				result = JSON.stringify(obj);
				console.log("RESULT:" + result);
			}
		});
	} else {
		const doc = bookAdmin.find({ isbnNumber: query }, function (err, data) {
			if (err) {
				console.log("SOMETHING WENT WRONG WHILE SEARCHING FOR ISBN!: ", err);
			} else if (data.length == 0) {
				console.log("NO RECORD FOUND!");
			} else {
				console.log("YOU'VE SEARCHED FOR: " + query);
				console.log("Bookname"+":" + data[0].fileName + " ID: " + data[0]._id + " ISBN: " + data[0].isbnNumber);
			}
		});
	}
	res.json(obj);
});

app.post('/login', async (req, res) => {
	let username = req.body.username;
	let password = req.body.password;
	let userid = await findUser(username, password);
	if (userid == "none") {
		res.json("WRONG PASSWORD OR USERNAME!");
	}
	if (loggedUser.mode == "user") {
		console.log("LOGGED:" + loggedUser.id + " " + loggedUser.username);
		res.redirect('/user');
	} else if (loggedUser.mode == "admin") {
		console.log("LOGGED:" + loggedUser.id + " " + loggedUser.username);
		res.redirect('/admin');
	}
});

app.post('/admin', (req, res) => {
	//Book name is stored in the bookname variable. Book's ISBN image is stored in bookImage object.
	let bookName = req.body.bookname.toLowerCase();
	let imageFile = req.files.bookImage;
	let imageAddress = './isbnPictures/' + bookName + ".jpeg";
	console.log("Name of the image file: " + imageFile.name);
	console.log("Image object: " + imageFile);
	console.log("Name of the book: " + bookName);

	imageFile.mv(imageAddress, function (error) {
		if (error) {
			console.log("Couldn't upload the isbn image file.");
			console.log(error);
		} else {
			console.log("Image file successfully uploaded!");
			readImageAndUploadBookInfo(imageAddress, bookName);
		}
	});
	res.redirect("/admin");
});

app.post('/return', async(req, res) => {
	let imageFile = req.files.returnBookImage;
	console.log("Name of the image file: " + imageFile.name);
	console.log("Image object: " + imageFile.tempFilePath);
	let bleagh = await getTextFromImage(imageFile.data);
	deleteBook(bleagh);
	res.json(bleagh);
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

function resetUserBookSettings(){
	loggedUser.hasMoreThanThreeBooks = false;
	loggedUser.hasOutOfDateBook = false;
	loggedUser.someOneHasBook = false;
}

async function deleteBook(isbn){
	let control = await bookUser.find({"_id": loggedUser.id, books:{"isbnNumber":isbn}});
	if(control.length == 0){
		console.log("You can't give back this book! Because you don't own it!");
	}else{
		let remove = await bookUser.findOneAndUpdate({"_id": loggedUser.id}, {$pull: {books:{bookIsbn:isbn}}},{new:true});
	}
	console.log(deneme);
	console.log("deneme: " + deneme);
}

//Book Handling. Decide whether the user is going to take book for the first time or not.
async function assignBook(isbnNumber) {
	await searchBookOwners(isbnNumber);
}

//Search book owners
async function searchBookOwners(isbnNumber) {
	const res = await bookUser.findById(loggedUser.id);
	let canTakeBook = false;
	//Check if the user have out of date book
	let outoOfDateBook = false;
	if (res == null) {
		console.log("THERE IS NO COLLECTION: " + res);
		await firstAssignment();
			canTakeBook = await whoHasTheBook(isbnNumber);
			if(canTakeBook){
				await addBook(isbnNumber);
			}else{
				//if canTakeBook is false then user can't take book. Because someone else owns the book.
				loggedUser.someOneHasBook = true;
			}
	}else if (res.books.length == 0) {
		console.log("BOOK ARRAY IS EMPTY!" + res);
			canTakeBook = await whoHasTheBook(isbnNumber);
			if(canTakeBook){
				await addBook(isbnNumber);
			}else{
				//if canTakeBook is false then user can't take book. Because someone else owns the book.
				loggedUser.someOneHasBook = true;
			}
	}else if (res.books.length != 0) {
		console.log("res.books.length: " +res.books.length);
		outoOfDateBook = await searchOutOfDateBook();
		if(outoOfDateBook){
			canTakeBook = await whoHasTheBook(isbnNumber);
			if(canTakeBook){
				if(res.books.length >= 3){
					console.log("You already have 3 books. You can't take more book!");
					loggedUser.hasMoreThanThreeBooks = true;
					return;
				}else{
					await addBook(isbnNumber);
				}
			}else{
				loggedUser.someOneHasBook = true;
			}
		}else{
			loggedUser.hasOutOfDateBook = true;
		}
	}
}

async function searchOutOfDateBook() {
	console.log("LOGGED USER ID: " + loggedUser.id);
	const res = await bookUser.find({ "_id": loggedUser.id });
	console.log(res);
	console.log(res[0].books.length);
	for (let m = 0; m < res[0].books.length; m++) {
		let anotherBottleDown = res[0].books[m].bookDate
		console.log(typeof anotherBottleDown);
		console.log("SYSTEMDATE: " + systemDate);
		console.log("RETURNDATE: " + res[0].books[m].returnDate);
		console.log(res[0].books[m].returnDate.getDate());
		console.log(res[0].books[m].returnDate.getMonth());
		console.log(res[0].books[m].returnDate.getFullYear());
		console.log(Math.floor((res[0].books[m].returnDate - systemDate) / (24 * 60 * 60 * 1000)));
		let dayDiff = Math.floor((Date.UTC(res[0].books[m].returnDate.getFullYear(), res[0].books[m].returnDate.getMonth(), res[0].books[m].returnDate.getDate()) - Date.UTC(systemDate.getFullYear(), systemDate.getMonth(), systemDate.getDate())) / (1000 * 60 * 60 * 24));
		console.log("DAYDIFF: " + dayDiff);
		if (dayDiff < 0) {
			console.log("You have out of date book. You can't take new book!");
			return false;
		} else {
			return true;
		}
	}
}

async function whoHasTheBook(isbn) {
	const res = await bookUser.find({ "books.bookIsbn": isbn });
	console.log("LENGTH!::::: " + res.length);
	if (res.length != 0) {
		console.log(res);
		for (var i = 0; i < res[0].books.length; i++) {
			console.log(res[0].books[i]);
		}
		const doc = await users.findById(res[0]._id);
		console.log(doc);
		console.log("A User Owned This Book!: " + doc.username + " " + res[0]._id + " " + res[0].books[0].bookIsbn + " " + res[0].books[0].bookDate);
		return false;
	} else {
		console.log("Nobody owns this book!: " + isbn);
		return true;
	}
}

async function addBook(isbnNumber) {
	let day = systemDate.getDate() + 7;
	let assigningDate = new Date(systemDate.getFullYear(), systemDate.getMonth(), day, 0, 0, 0, 0);
	let book = { "bookIsbn": isbnNumber, "bookDate":systemDate,"returnDate": assigningDate };
	await bookUser.findOneAndUpdate({ _id: loggedUser.id }, { $push: { books: book } })
		.catch((err) => {
			console.log(err);
		});
	console.log("ASSIGNING DATE" + assigningDate);
	console.log("OLD SYSTEM DATE: " + systemDate);
}

//If user can't be found on the database this function is called. And user is added.
async function firstAssignment() {
	let bookAssign = new bookUser({
		_id: loggedUser.id,
		books: []
	});
	await bookAssign.save()
		.then((data) => {
			console.log("USER ADDED TO THE COLLECTION: " + data);
		})
		.catch((err) => {
			console.log("COULDN'T ASSIGN THE BOOK: " + err);
		})
}

async function fuk(isbnText, bookName) {
	console.log("UPLOADING ISBN NUMBER: " + isbnText + " ...");
	const dbStateText = await addBookInfo(isbnText, bookName);
	console.log("DB STATE: " + dbStateText);
	const books = await searchBook();
	for (let i = 0; i < books.length; i++) {
		console.log("Book " + i + ": " + books[i]);
	}
}

async function readImageAndUploadBookInfo(imageAddress, bookName) {
	getTextFromImage(imageAddress)
		.then((isbnText) => {
			fuk(isbnText, bookName);
		})
		.catch();
}

//Image Processing
async function getTextFromImage(address) {
	const worker = createWorker();
	await worker.load()
	await worker.loadLanguage('eng')
	await worker.initialize('eng')

	const { data: { text } } = await worker.recognize(address);
	//Parsing the text
	let temporaryText = text.split("\n")[0];
	let text2 = temporaryText.replace("ISBN ", "");
	temporaryText = text2.replace(/-/g, "");
	await worker.terminate()

	return temporaryText;
}

//Creating Date Variable

function changeSystemDate(dayNumber) {
	console.log("variable type: " + typeof dayNumber);
	console.log("Number of days:"+dayNumber);
	if (typeof dayNumber == "number") {
		systemDate = new Date(systemDate.getFullYear(), systemDate.getMonth(), (systemDate.getDate() + dayNumber), 0, 0, 0);
		console.log("NEW SYSTEM DATE!: " + systemDate);
	} else {
		console.log("ERROR: dayNumber Variable is not a number!");
	}
}


//Add Book Info
function addBookInfo(number, name) {
	return new Promise(async (resolve) => {
		console.log("ADDBOOKINFO RECEIVED: " + number);
		const uploadingPostedData = new bookAdmin({
			"isbnNumber": number,
			"fileName": name
		});
		await uploadingPostedData.save()
			.then(
				data => {
					console.log(data);
					resolve("The book uploaded successfully!");
				})
			.catch(err => {
				console.log("SOMETHING WENT WRONG WHILE UPLOADING DATA TO THE DATABASE!: " + err);
			});
	})
}

//Search Books
function searchBook() {
	return new Promise(resolve => {
		const books = bookAdmin.find();
		resolve(books);
	})
}
//Search Users
async function findUser(username, password) {
	const res = await users.find({ "username": username, "password": password });
	console.log(res);
	if (res.length == 0) {
		console.log("COULDN'T FIND THE USER IN THE DATABASE!");
		return "none";
	} else {
		loggedUser.username = res[0].username;
		loggedUser.id = res[0]._id;
		loggedUser.mode = res[0].mode;
		loggedUser.logged = true;
		return res[0]._id.toString();
	}
}
