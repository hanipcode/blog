---
title: "Sebuah Pengantar Tentang Struktur Aplikasi React"
date: 2020-06-19T05:10:44.606Z
draft: false
toc: false
images:
cover: "img/2.jpg"
tags:
  - untagged
---



Pada tulisan kali ini, kita akan membahas hal hal yang  terkait react seperti one way data binding, flux architecture, dll.

### One Way Data Binding
Secara umum, React memakai paradigma jalur data satu arah atau "one way data binding". Pertama mari kita bahas apa yang dimaksud dengan data binding. data binding adalah proses integrasi antara data atau props di dunia JS/React, kedalam dunia Browser/HTML. Beberapa framework menggunakan jalur data dua arah kurang lebih seperti demikian:
{{<mermaid>}}
graph TD;
DOM-->Watcher_DOM
Watcher_DOM-->DOM
Watcher_DOM-->Watcher_Framework
Watcher_Framework-->Watcher_DOM
Watcher_Framework-->Data
Data-->Watcher_Framework
{{</mermaid>}}
Bisa dilihat bahwa ada watcher masing masing yang memantau data pada framework dan juga yang memantau  data/event pada DOM. sehingga ketika salah satu berubah misalkan ada input, maka data pada dunia JS/Framework juga akan berubah. dengan metode seperti ini, kita hampir tidak perlu secara manual menambahkan event pada DOM. contoh (bukan fraamework  sebenarnya):
```html
<input value={someModelFromFramework}>
```
Masalahnya  dengan arsitektur seperti ini adalah, semakin besar aplikasi kita maka semakin banyak juga watcher yang di attach. karena membutuhkaan 2 watcher di setiap element.

React semenjak awal menganut one way data binding yang kurang lebih seperti berikut
{{<mermaid>}}
graph TD;
DOM-->Event_Handler
Event_Handler-->Props/Data
Props/Data-->Watcher
Watcher-->DOM
{{</mermaid>}}

Seperti dilihat pada diagram diatas, Di environment React, DOM tidak memiliki akses langsung terhadap props/data yang ada di environemnt React. ketika  ingin mengubah data pada props/state maka harus melalui event handler seperti dibawah (contoh menggnakan class component agar lebih mudah dipahami):

```js
class MyInput extends React.Component {
  state = {
    value: '',
  };

  updateValue = (value) => {
    this.setState({ value });
  }

  render() {
    return (
      <input onChange={(e) => this.updateValue(e.target.value)} />
    )
  }
}
```
Itulah yang dimaksud one way data binding pada react.

## Arsitektur Flux dan Unidirectional Data Flow
Lalu apa yang dimaksud Arsitektur Flow ? Seperti kita bahas diatas "One Way Data Binding" adalah *a way to think* atau paradigma. Tentu saja banyak cara untuk mencapai hal tersebut. Maka Flux adalah salah satu blueprint pengolahan data secara "One Way Data Bindiing" tersebut. Flux menganut Unidirectional Data Flow atau arus data satu arah. dengan diagram seeperti berikut
{{<mermaid>}}
graph TD;
Action-->Dispatcher
Dispatcher-->Store
Store-->View
{{</mermaid>}}
Mari kita bahas diagram diatas. Kita bahas dari yang paling bawah. View ini  adalah tampilan berupa HTML atau anggap saja component React. View ini menampilkan data sesuai data yang ada pada store, dan ketika store berubah, view akan melakukan rerender untuk match dengan data yang ada di store. Namun yang perlu di ingat, view ini tidak dapat secara langsung melakukan upadte terhadap store. sehingga memerlukan action:
{{<mermaid>}}
graph TD;
Action-->Dispatcher
Dispatcher-->Store
Store-->View
View-->Action
{{</mermaid>}}
Action adalah sebuah payload atau informasi yang kemudian akan diproses oleh dispatcher. Dispatcher adalah seebuah fungsi yang menerima informasi dan akan melakukan update terhadap store, yang pada akhirnya setiap perubahan store  akan membuat View melakukan render ulang dengan data baru.

## Perbedaan Flux dan MVC ? (Flux = Strict MVC)
Sebenarnya apakah flux dan MVC berbeda ? secara konsep sebenarnya sama saja. Karena mvc yang sebenarnya juga memiliki pemisahan modul yang kuat antara model, view, dan controller. dimana view akan mendapat data dari model, tapi view sendiri tidak dapat secara langsung mengupdate model melainkan melalui kontroller. Jadi *in a way* MVC yang strict memiliki jalur data yang satu arah.

Namun pada kenyataanya di dunia frontend atau javascript. Hal itu menjadi berubah. karena tidak seperti masa masa penggunaan server-side rendering seperti PHP dimana ketika akan pindah page atau menambah sesuatu si halaman webpage ini akan reload keseluruhan. Di client side rendering kita mengenal AJAX, sejak jaman jQuery masih populer dulu.

Masalahnya dengan MVC di frontend adalah, jalur datanya menjadi dua arah, dimana misalkan kita memiliki sebuah model di suatu js framework. View (HTML element sepert input, misalnya) dapat secara langsung  merubah data di model tersebeut tanpa melalui event. dan ini menjadi masalah awal kenapa akhirnya facebook membuat React, mereka memiliki  masalah di chat sistem mereka yang awalnya meenggunakan MVC namun tidak scale.

Di React, semua perubahan data ke state maupun props harus melalui event, dan diupdate secara deklaratif. ini membawa  kita ke topik selanjutnya: Declarative programming,  apa itu ?


## React dan Declarative UI
Nah lalu apa sih yang dimaksud dengan declarative, apa prebedaanya dengan imperative programming ?
Declarative programming itu mengutamakan pada statement atau pernyataan, dan menyembunyikan proses. Sedangkan imperative programming mengutamakan proses, jadi cenderung lebih panjang. 
Misalkan sumber kode dibawah
```javascript
const myArray = [];
for (let i = 0; i < 10; i+=1) {
  myArray.push(i);
}
```
kode tersebut cukup simpel. dia menambahkan angka 0 sampai dengan 9 ke array. bagaimana untuk membuatnya lebih deklaratif ? caranya adalah  dengan kita abstraksikan proses tersebut dan masukan kedalam fungsi misalkan kita berinama fungsi tersebut tambah array:
```javascript
function tambahKeArray(arr,nilaiMinimum,nilaiMaximum) {
  const returnedArr = [...arr];
  for (let i = nilaiMinimum; i < nilaiMaximum; i+= 1) {
    returnedArr.push(i);
  }
  return returnedArr;
}
const myArray = [];
tambahKeArray(myArray, 0, 9);
```
nah kalau kamu lihat, akan lebih jelas kan kode yang kedua. mungkin untuk case ini terlihat  lebih panjang.  namun justru karena kita sudah membuat fungsi maka ketika akan melakukan proses tersebut lagi kita hanya  perlu memanggil fungsi "tambahKeArray". jadi declarative programming ni memberikan penamaan pada sebuah proses sehingga makin jelas.

Lalu apa hubunganya dengan frontend ? well di masa jquery/vanilla js dulu kamu pasti sering melakukan ini kan untuk meng-handle pengambilan data melaluii server
```javascript
// init loading
document.querySelector(".someSelector").innerHtml = 'Loading...'
fetch("https://example.com").then(resp => resp.json()).then(data => {
  const text = data.text
  document.querySelector(".someSelector").innerHtml = text;
});
```
well di situ kita melakukan proses pengeditan isi cntent html sebuah element. bagaimana membuaat nya lebih declarative ?
```javascript
function updateElementContent(selector, content) {
  document.querySelector(selector).innerHtml = content;
}
// init loading
updateElementContent(".someSelector", "Loading...");
fetch("https://example.com").then(resp => resp.json()).then(data => {
  const text = data.text
  updateElementContent(".someSelector", text);
});
```
dengan demikian code kita lebih jelas bukan ? bahwa proses yang kita lakukan adalah mengupdate konten pada sebuah element. dan juga meminimalisir adanya typo atau kalau proses  tersebut panjang meminimalisir adanya kelupaan menambahkan satu atau  dua step. karna keseluruhan step nya telah dirangkum dalam sebuah fungsi.


Lalu kenapa React disebut frameework yang declarative ? Karena react ya menyembunyikan banyak proses dan memberikan kita antarmuka nya. misalkan bagaimana cara melakukan sesuatu diawal element muncul ? disediakan lah lifecycle. bagaimana mengupdate state ? disediakan lah antarmuka fungsi `setState`. dan bahkan kalau kita tidak menilik source code react mungkin kita sendiri tidak tahu bagaimana react mengupdate sebeuah state behind the scene.

Apakah teman teman tertarik untuk membahasnya ?

