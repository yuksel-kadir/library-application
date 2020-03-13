const express = require("express");
const path = require("path");
const fileUpload = require("express-fileupload");
//const { createWorker } = require('tesseract.js');
//const worker = createWorker();
const app = express();
const PORT = process.env.PORT || 5000;

//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended:false}));
app.use(fileUpload());

app.get('/admin.html', (req, res) =>{
	res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.post('/', (req, res) => {
	var bookName = req.body.bookname;
	var imageFile = req.files.book;
	imageFile.name = bookName+".png";
	console.log(req.files.book.name);
	
	imageFile.mv("./isbnPictures/" + imageFile.name, function(error){
		if(error){
			console.log("Couldn't upload the isbn image file.");
			console.log(error);
		}else{
			console.log("Image file successfully uploaded!");
		}
	});
	console.log(req.body.bookname);
	res.sendFile(path.join(__dirname, 'public', 'user.html'));
	//res.send(alert("OK"));
});

/*
(async () => {
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  const { data: { text } } = await worker.recognize('sample-isbn-9781782808084.jpg');
  //console.log(text);
  temporaryText = text.split("\n")[0];
  var text2 = temporaryText.replace("ISBN ","");
  temporaryText = text2.replace(/-/g,"");
  console.log(temporaryText);
  await worker.terminate();
})();

app.use('/submit-form', (req, res) => {
	const bookName = req.body.bookname;
	console.log(bookName);
	res.end(alert("Kayıt eklendi"));
});
 */
/*
app.use(express.static(path.join(__dirname, 'public')));
const myForm = document.getElementById("myForm");
myForm.addEventListener("submit", (e) => {
	e.preventDefault();
});
*/

app.listen(PORT, ()=> console.log(`Server started on port ${PORT}`));

