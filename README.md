# Kütüphane Uygulaması

## Projenin Amacı 
Localhostta çalışan, ISBN numarasını resimden okuyabilen, veri tabanına kitap adı, ISBN numarası, kullanıcı bilgisi vs. gibi verileri işleyebilen bir kütüphane uygulaması oluşturmak.

## Projenin Sahip Olduğu Fonksiyonlar
###### Yönetici Tarafı
- Kitap adı ile birlikte kitabın ISBN kodunu fotoğraftan okuyarak kitap bilgisinin eklenmesi.
- Sistem zamanını belirtilen gün kadar ötelenmesi.
- Kitap alan kullanıcıların hangi kitabı, hangi tarihte aldığı, kitabın ISBN numarası, kitabın iade tarihi gibi bilgilerle listelenmesi.

###### Kullanıcı Tarafı
- Kitap adı veya ISBN'e göre kütüphanede veri tabanında arama yapılması.
- Kitap adı veya ISBN'e göre kitabın kullanıcı envanterine eklenmesi.
- Kitabın ISBN kodunun bulunduğu fotoğrafı sisteme yükleyerek, daha önceden alınan kitabın kütüphaneye iade edilmesi.

## Projede Kullanılan Paketler
- [express](https://expressjs.com)
- [express-fileupload](https://www.npmjs.com/package/express-fileupload)
- [mongoose](https://mongoosejs.com)
- [tesseract.js](https://github.com/naptha/tesseract.js#installation)
- [nodemon](https://www.npmjs.com/package/nodemon)

## Proje Dökümanı
[Döküman](https://www.dropbox.com/s/16o1yfhsh96erup/YazlabII-Proje1.pdf?dl=0)
> Projenin server tarafı Nodejs, veri tabanı kısmı Mongodb, arayüz kısmında ise HTML, CSS ile yazıldı.

## Ekran Görüntüleri
![loginPage](ss/login.png)
<br>
![userPage](ss/user.png)
<br>
![admiPage](ss/admin.png)

## Kaynaklar
1. [Upload multiple files with AJAX/XMLHttpRequest](https://www.youtube.com/watch?v=dBIfkRzJGOM)
2. [Using files from web applications](https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications)
3. [Mongoose Count](https://kb.objectrocket.com/mongo-db/mongoose-count-726#countdocuments%2528%2529+and+estimateddocumentcount%2528%2529)
4. [Getting Date and Time in Node.js](https://usefulangle.com/post/187/nodejs-get-date-time)
5. [Push items into mongo array via mongoose
](https://stackoverflow.com/questions/33049707/push-items-into-mongo-array-via-mongoose)
6. [Express.js: Handling / processing forms](https://www.hacksparrow.com/webdev/express/handling-processing-forms.html)
7. [Handling forms in Express
](https://flaviocopes.com/express-forms/)
8. [Hello World Example](https://expressjs.com/en/starter/hello-world.html)
9. [tesseract.js](https://github.com/naptha/tesseract.js#installation)
10. [OCR in JavaScript with Tesseract.js](https://dev.to/yvonnickfrin/ocr-in-javascript-with-tesseract-hnl)
11. [Cannot read property 'send' of null - worker.terminate()](https://github.com/naptha/tesseract.js/issues/400)
12. [Node.js & Express ep. 18 - Uploading Files & Moving Files](https://www.youtube.com/watch?v=tySR7gXYfyI)
13. [How to add update and delete object in Array Schema in Mongoose/MongoDB](https://tech-blog.maddyzone.com/node.js/add-update-delete-object-array-schema-mongoosemongodb)
14. [How to Use findOneAndUpdate() in Mongoose](https://mongoosejs.com/docs/tutorials/findoneandupdate.html)
15. [AJAX Crash Course (Vanilla JavaScript)](https://www.youtube.com/watch?v=82hnvUYY6QA)
16. [Back To The Basics: How To Generate a Table With JavaScript](https://www.valentinog.com/blog/html-table/)
