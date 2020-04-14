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
let errorCode;
let loggedUser = {
	id: "",
	username: "",
	mode: "",
	logged :false,
	hasMoreThanThreeBooks:false,
	hasOutOfDateBook:false,
	someOneHasBook:false
}

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
console.log("ADRES: "+address);
mongoose.connection
	.once('open', () => {
		console.log('Kütüphane veri tabanına bağlanıldı.');
		console.log("Sistem Tarihi: " + systemDate.getDate() + " " + (systemDate.getMonth() + 1) + " " + systemDate.getFullYear());
	})
	.on('error', (error) => {
		console.log("VERİ TABANINA BAĞLANIRKEN BİR ŞEYLER TERS GİTTİ! : ", error);
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

app.get('/', (req, res) => {    
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
	console.log("ARANAN:" + query);
	let regex = /[A-Za-z]/g;
	const found = query.match(regex);
	resetUserBookSettings();
	//Checks if the string is a ISBN or a book name.
	if (found) {
		query = query.toLowerCase();
		console.log(query);
		const doc = await bookAdmin.find({ fileName: query }, async function (err, data) {
			if (err) {
				console.log("KİTAP ADINI ARARKEN BİR ŞEYLER TERS GİTTİ!: ", err);
				res.json("error");
			} else if (data.length == 0) {
				console.log("KİTAP BULUNAMADI!");
				res.json(obj);
			} else {
				await searchBookOwners(data[0].isbnNumber);
				//assignBook(data[0].isbnNumber);
				console.log("ARADIĞINIZ: " + query);
				console.log("Kitap Adı: " + data[0].fileName + " ID: " + data[0]._id + " ISBN: " + data[0].isbnNumber);
				obj = {hasMoreThanThreeBooks:loggedUser.hasMoreThanThreeBooks, hasOutOfDateBook:loggedUser.hasOutOfDateBook,someOneHasBook:loggedUser.someOneHasBook}
				result = JSON.stringify(obj);
				res.json(obj);
			}
		});
	} else {
		const doc = await bookAdmin.find({ isbnNumber: query }, async function (err, data) {
			if (err) {
				console.log("ISBN ARARKEN BİR ŞEYLER TERS GİTTİ!: ", err);
				res.json("error");
			} else if (data.length == 0) {
				console.log("KİTAP BULUNAMADI!");
				res.json(obj);
			} else {
				await searchBookOwners(data[0].isbnNumber);
				//assignBook(data[0].isbnNumber);
				console.log("ARADIĞINIZ: " + query);
				console.log("Kitap Adı: " + data[0].fileName + " ID: " + data[0]._id + " ISBN: " + data[0].isbnNumber);
				obj = {hasMoreThanThreeBooks:loggedUser.hasMoreThanThreeBooks, hasOutOfDateBook:loggedUser.hasOutOfDateBook,someOneHasBook:loggedUser.someOneHasBook}
				result = JSON.stringify(obj);
				res.json(obj);
			}
		});
	}
	//res.redirect('/user');
});

app.post('/setDate', (req, res) => {
	let day = parseInt(req.body.dayNumber);
	let state = changeSystemDate(day);
	if(state == 0){
		console.log("TARİHİ DEĞİŞTİRİRKEN HATA MEYDANA GELDİ!");
		res.json(0);
	}else{
		let str = systemDate.getDate() + " " + (systemDate.getMonth()+1)+" "+systemDate.getUTCFullYear();
		//console.log(str);
		//console.log(JSON.stringify(str));
		res.json(str);
	}
	//res.json(state);
	//res.redirect('/admin');
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
				console.log("KİTAP ADINI ARARKEN BİR ŞEYLER TERS GİTTİ!!: ", err);
			} else if (data.length == 0) {
				console.log("KAYIT BULUNMADI!!");
			} else {
				console.log("ARADIĞINIZ: " + query);
				console.log("Kitap Adı: " + data[0].fileName + " ID: " + data[0]._id + " ISBN: " + data[0].isbnNumber);
				obj = {bookname:data[0].fileName, id:data[0]._id, isbn:data[0].isbnNumber};
				result = JSON.stringify(obj);
				//console.log("SONUÇ:" + result);
			}
		});
	} else {
		const doc = await bookAdmin.find({ isbnNumber: query }, function (err, data) {
			if (err) {
				console.log("ISBN ARANIRKEN BİR ŞEYLER TERS GİTTİ!: ", err);
			} else if (data.length == 0) {
				console.log("KAYIT BULUNAMADI!");
			} else {
				console.log("ARADIĞINIZ: " + query);
				console.log("Kitap Adı"+":" + data[0].fileName + " ID: " + data[0]._id + " ISBN: " + data[0].isbnNumber);
				obj = {bookname:data[0].fileName, id:data[0]._id, isbn:data[0].isbnNumber};
				result = JSON.stringify(obj);
				//console.log("SONUÇ:" + result);
			}
		});
	}
	//console.log("OBJ: " + obj);
	res.json(obj);
});

app.post('/login', async (req, res) => {
	let username = req.body.username;
	let password = req.body.password;
	let userid = await findUser(username, password);
	if (userid == "none") {
		res.redirect('/login');
	}
	if (loggedUser.mode == "user") {
		console.log("GİRİŞ YAPAN:" + loggedUser.id + " " + loggedUser.username);
		res.redirect('/user');
	} else if (loggedUser.mode == "admin") {
		console.log("GİRİŞ YAPAN:" + loggedUser.id + " " + loggedUser.username);
		res.redirect('/admin');
	}
});

app.post('/admin', (req, res) => {
	//Book name is stored in the bookname variable. Book's ISBN image is stored in bookImage object.
	let bookName = req.body.bookname.toLowerCase();
	let imageFile = req.files.bookImage;
	let imageAddress = './isbnPictures/' + bookName + ".jpeg";
	console.log("Resim dosyasının adı: " + imageFile.name);
	//console.log("Image object: " + imageFile);
	console.log("Kitabın Adı: " + bookName);

	imageFile.mv(imageAddress, async function (error) {
		if (error) {
			console.log("Resim dosyası upload edilemedi.");
			console.log(error);
			errorCode = 0;
			res.json(errorCode);
		} else {
			console.log("Resim dosyası başarıyla upload edildi!");
			await readImageAndUploadBookInfo(imageAddress, bookName);
			console.log("ERRORCODE: " + errorCode);
			res.json(errorCode);
		}
	});
	//res.redirect("/admin");
});

app.post('/return', async(req, res) => {
	let imageFile = req.files.returnBookImage;
	console.log("Resim dosyasının adı: " + imageFile.name);
	//console.log("Image object: " + imageFile.tempFilePath);
	let bleagh = await getTextFromImage(imageFile.data);
	let status  = await deleteBook(bleagh);
	res.json(status);
});

app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda başlatıldı!`));

function resetUserBookSettings(){
	loggedUser.hasMoreThanThreeBooks = false;
	loggedUser.hasOutOfDateBook = false;
	loggedUser.someOneHasBook = false;
}

async function deleteBook(isbn){
	console.log("SİL: " + isbn);
	let control = await bookUser.find({"_id": loggedUser.id, "books.bookIsbn":isbn});
	console.log("control: " + control);
	//console.log(typeof isbn);
	
	if(control.length == 0){
		console.log("Kitaba sahip olmadığınız için geri veremezsiniz!");
		return 0;
	}else{
		let remove = await bookUser.findOneAndUpdate({"_id": loggedUser.id}, {$pull: {books:{bookIsbn:isbn}}},{new:true});
		console.log("Silindikten sonra kullanıcı envanteri: " + remove);
		return 1;
	}
	
}

//Search book owners
async function searchBookOwners(isbnNumber) {
	const res = await bookUser.findById(loggedUser.id);
	let canTakeBook = false;
	//Check if the user have out of date book
	let outoOfDateBook = false;
	if (res == null) {
		console.log("COLLECTION YOK!: " + res);
		await firstAssignment();
			canTakeBook = await whoHasTheBook(isbnNumber);
			if(canTakeBook){
				await addBook(isbnNumber);
			}else{
				//if canTakeBook is false then user can't take book. Because someone else owns the book.
				loggedUser.someOneHasBook = true;
			}
	}else if (res.books.length == 0) {
		console.log("KİTAP DİZİSİ BOŞ!" + res);
			canTakeBook = await whoHasTheBook(isbnNumber);
			if(canTakeBook){
				await addBook(isbnNumber);
			}else{
				//if canTakeBook is false then user can't take book. Because someone else owns the book.
				loggedUser.someOneHasBook = true;
			}
	}else if (res.books.length != 0) {
		//console.log("res.books.length: " +res.books.length);
		outoOfDateBook = await searchOutOfDateBook();
		if(outoOfDateBook){
			canTakeBook = await whoHasTheBook(isbnNumber);
			if(canTakeBook){
				if(res.books.length >= 3){
					console.log("Zaten 3 kitaba sahipsiniz! Daha fazla kitap alamazsınız!");
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
	console.log("GİRİŞ YAPAN KULLANICI ID: " + loggedUser.id);
	const res = await bookUser.find({ "_id": loggedUser.id });
	console.log(res);
	console.log(res[0].books.length);
	for (let m = 0; m < res[0].books.length; m++) {
		let anotherBottleDown = res[0].books[m].bookDate
		console.log(typeof anotherBottleDown);
		console.log("Sistem Tarihi: " + systemDate);
		console.log("İade Tarihi: " + res[0].books[m].returnDate);
		console.log(res[0].books[m].returnDate.getDate());
		console.log(res[0].books[m].returnDate.getMonth());
		console.log(res[0].books[m].returnDate.getFullYear());
		console.log(Math.floor((res[0].books[m].returnDate - systemDate) / (24 * 60 * 60 * 1000)));
		let dayDiff = Math.floor((Date.UTC(res[0].books[m].returnDate.getFullYear(), res[0].books[m].returnDate.getMonth(), res[0].books[m].returnDate.getDate()) - Date.UTC(systemDate.getFullYear(), systemDate.getMonth(), systemDate.getDate())) / (1000 * 60 * 60 * 24));
		console.log("Gün Farkı: " + dayDiff);
		if (dayDiff < 0) {
			console.log("İade tarihi geçmiş kitaba sahipsiniz! Yeni kitap alamazsınız!");
			return false;
		} else {
			return true;
		}
	}
}

async function whoHasTheBook(isbn) {
	const res = await bookUser.find({ "books.bookIsbn": isbn });
	//console.log("LENGTH!: " + res.length);
	if (res.length != 0) {
		console.log(res);
		for (var i = 0; i < res[0].books.length; i++) {
			console.log(res[0].books[i]);
		}
		const doc = await users.findById(res[0]._id);
		console.log(doc);
		console.log("Başka bir kullanıcı bu kitabı aldı!: " + doc.username + " " + res[0]._id + " " + res[0].books[0].bookIsbn + " " + res[0].books[0].bookDate);
		return false;
	} else {
		console.log("Kitap boşta!: " + isbn);
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
	console.log("Kitap Veriliş Tarihi: " + assigningDate);
	console.log("Eski Sistem Tarihi: " + systemDate);
}

//If user can't be found on the database this function is called. And user is added.
async function firstAssignment() {
	let bookAssign = new bookUser({
		_id: loggedUser.id,
		books: []
	});
	await bookAssign.save()
		.then((data) => {
			console.log("COLLECTION'A KULLANICI EKLENDİ: " + data);
		})
		.catch((err) => {
			console.log("KİTAP VERİLEMEDİ: " + err);
		})
}

async function fuk(isbnText, bookName) {
	console.log("ISBN UPLOAD EDİLİYOR: " + isbnText + " ...");
	const dbStateText = await addBookInfo(isbnText, bookName);
	console.log("VT DURUMU: " + dbStateText);
	const books = await searchBook();
	for (let i = 0; i < books.length; i++) {
		console.log("KİTAP " + i + ": " + books[i]);
	}
}

async function readImageAndUploadBookInfo(imageAddress, bookName) {
	let isbnText = await getTextFromImage(imageAddress).catch({
		errorCode: 2
	});
	await fuk(isbnText, bookName);
	/*
	getTextFromImage(imageAddress)
		.then((isbnText) => {
			fuk(isbnText, bookName);
		})
		.catch(

		);*/
}

//Add Book Info
function addBookInfo(number, name) {
	return new Promise(async (resolve) => {
		console.log("ADDBOOKINFO FONKSİYONUNUN ALDIĞI ISBN: " + number);
		const uploadingPostedData = new bookAdmin({
			"isbnNumber": number,
			"fileName": name
		});
		await uploadingPostedData.save()
			.then(
				data => {
					console.log(data);
					errorCode = 1;
					resolve("Kitap başarıyla veri tabanına eklendi!");
				})
			.catch(err => {
				console.log("VERİ TABANINA KİTAP EKLENİRKEN HATA OLUŞTU!: " + err);
				errorCode = 2;
			});
	})
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
	//console.log("variable type: " + typeof dayNumber);
	console.log("GÜN SAYISI:"+dayNumber);
	if (typeof dayNumber == "number") {
		systemDate = new Date(systemDate.getFullYear(), systemDate.getMonth(), (systemDate.getDate() + dayNumber), 0, 0, 0);
		console.log("YENİ SİSTEM TARİHİ!: " + systemDate);
		return 1;
	} else {
		console.log("ERROR: dayNumber değişkeni bir sayı değil!");
		return 0;
	}
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
		console.log("VERİ TABANINDA KULLANICI BULUNAMADI!");
		return "none";
	} else {
		loggedUser.username = res[0].username;
		loggedUser.id = res[0]._id;
		loggedUser.mode = res[0].mode;
		loggedUser.logged = true;
		return res[0]._id.toString();
	}
}
