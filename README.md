# Kütüphane Uygulaması

## Projenin Amacı 
Localhostta çalışan, ISBN numarasını resimden okuyabilen, veri tabanına kitap adı, ISBN numarası, kullanıcı bilgisi vs. gibi verileri işleyebilen bir kütüphane uygulaması oluşturmak.

## Projenin Sahip Olduğu Fonksiyonlar
###### Yönetici Tarafı
- Kütüphane sistemine yönetici olarak giriş yapıp, kitap adı ile birlikte kitabın ISBN kodunu fotoğraftan okuyarak kitap bilgisinin eklenmesi.
- Yönetici olarak giriş yapıldığında sistem zamanını belirtilen gün kadar ötelenmesi.
- Kitap alan kullanıcıların hangi kitabı hangi tarihte aldığı, kitabın ISBN numarası, kitabın iade tarihi ile listelenmesi.

###### Kullanıcı Tarafı
- Kitap adı veya ISBN'e göre kütüphanede veri tabanında arama yapılması.
- Kitap adı veya ISBN'e göre kitabın kullanıcı envanterine eklenmesi.
- Kitabın ISBN kodunun bulunduğu fotoğrafı sisteme yükleyerek, daha önceden alınan kitabın iade edilmesi.

> Proje Nodejs ile Mongodb, HTML, CSS kullanılarak yazıldı.

## Projede Kullanılan Paketler
- express
- express-fileupload
- mongoose
- tesseract.js
- nodemon

