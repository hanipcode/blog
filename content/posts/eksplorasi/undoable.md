---
title: "Membuat Struktur Data yang dapat di Undo di Javascript"
date: 2020-10-15T17:08:49+07:00
draft: false
toc: false
images:
tags:
  - untagged
---

Di artikel sebelumnya pas ngebahas Functor di FP kita sempat nyobain bikin struktur data sendiri di javascript ya itu struktur data `ScoreList`. 

Nah di artikel kali ini mari kita coba bikin sebuah struktur data yang lebih berguna. misalkan kita ingin membuat struktur data yang dapat di undo dan di redo, kurang lebih akan menjadi seperti dibawah:

```javascript
function Undoable(data) {
  this.value = data;
  this.past = [];
  this.future = [];
}

Undoable.prototype.update = function(data) {
  this.future = [];
  this.past.push(this.value);
  this.value = data;
}

Undoable.prototype.undo = function() {
  if (this.past.length === 0) {
    console.warn('you already reach the end')
    return;
  }
  this.future.push(this.value);
  this.value = this.past[this.past.length - 1];
  this.past.pop();
}

Undoable.prototype.redo = function() {
  if (this.future.length === 0) {
    console.warn("we already come to where we begin. the future is unpredictable");
    return;
  }
  this.past.push(this.value);
  this.value = this.future.pop();
}
```

dan mari kita test: 

```javascript
const item = new Undoable(5);
console.log(item.value)
// 5;
item.update(6);
item.update(7);
item.update(8);
console.log(item.value)
// 8
item.undo();
console.log(item.value)
// 7
item.redo()
console.log(item.value)
// 8
```

struktur data tersebut juga akan work dengan tipe data yang lebih kompleks baik array maupun object.

mungkin kalian akan bertanya-tanya, kalau gitu bukan-nya berarti ujung ujungnya kita OOP (Object Oriented Programming) ? kan bisa di bilang Undoable itu Class dan update, redo, dna undo itu property ?. Enggak juga sebenernya. apalagi sebenarnya method dan prototype agak beda, tapi mungkin itu bahas lain waktu, masi mager jelasinnya.
Apalgi, FP Bukan berarti sama sekali program kita ga punya class. tapi biasanya di FP pun untuk mengatasi feature language yang enggak ada dan mempermudah hidup kita juga bakal bikin struktur data struktur data sendiri, lalu melakukan komposisi. makanya kalau kita menggunakan paradigma FP maka akan jarang menemukan `inheritance`. bahkan sebenernya di OOP juga salah satu mantra clean code nya

> composition over inheritance

Yah udah pokoknya tentang itu bahas artikel nanti aja, mager.

nah tapi masih ada masalah nih, sama struktur data yang kita buat. di struktur data yang kita buat, kita masih bisa mengutak-atik property dari `instance` nya semisal

```javascript
const item = new Undoable(5);
console.log(item.value)
// 5;
item.update(6);
item.value = 7;
console.log(item.value)
// 7
```

bahkan kita bisa menulis ulang masa lalu maupun masa depan:

```javascript
const item = new Undoable(5);
console.log(item.value)
// 5;
item.update(6);
item.past = [10];
item.undo();
console.log(item.value)
// 10
```

sungguh struktur data yang di luar nalar.

kalau data nya masih bisa diubah ubah, maka kita ga bisa yakin 100% kepada struktur data ini. karena yang bisa berubah berubah itu sangat susah dipercaya ~ ea.

Nah mari kita bikin versi struktur data Undoable ini yang tidak dapat dirubah dari luar

```javascript
function Undoable(initialData) {
  let _data = initialData;
  let _past = [];
  let _future = [];
  
  function _updateValue(newValue) {
    _past = [..._past, _data];
    _future = [];
    _data = newValue;
  }
  
  function _undo() {
    if (_past.length === 0) {
      console.warn('you already reach the end')
      return;
    }
    _future = [..._future, _data];
    _data = _past[_past.length -1];
    _past.pop();
  }
  
  function _redo() {
    if (_future.length === 0) {
      console.warn("we already come to where we begin. the future is unpredictable");
      return;
    }
    _past = [..._past, _data];
    _data = _future[_future.length - 1];
    _future.pop();
  }
  
  // add private getter
  Object.defineProperty(this, 'value', {
    get: () => _data,
  });
  
  this.update = _updateValue;
  this.undo = _undo;
  this.redo = _redo;
  
  Object.freeze(this);
}
```

nah disini kita merubah property `value` menjadi getter yang enggak `writeable`. dan juga kita membuat nilai past dan future dari struktur data ini variabel local, bukan `property`. misal dicoba

```javascript
const item = new Undoable(5);
console.log(item.value)
// 5;
item.update(6);
item.value = 7;
console.log(item.value)
// 6
```



sebenernya di atas saya agak curang, dari yang awalnya kita pake prototype, sekarang fungsi `update`, `undo`,dan `redo` nya ini menjadi property atau method, dan jadi makin mendekati OOP. apakah ada bedanya ? Ada. intinya tuh ya, kalau pake method seperti diatas, maka fungsi ini akan dibikin setiap object nya di `instantiate`. jadinya setiap object itu akan punya fungsi update nya sendiri sendiri. sedangkan prototype tu pake delegasi gitu, jadi fungsi nya tetep cuma 1. penjelasan detail nya stay tune artikel selanjutnya aja ya.

terus ada ga cara biar kita bisa tetep pake prototype tapi tetep Immutable gitu. ya bisa, kita bisa wrap pake IIFE dan bikin scoping buat variabel nya gitu. jadi kita bisa bikin variabel _data, dll nya ini bisa diakses dari prototype tapi enggak bocor. tapi daripada ribet pake cara jaman jaman jQuery gitu mending kalau udah pake sistem module dan ga langsung ngoding di browser kita pisahin aja file nya jadi entar implementasinya kurang lebih

```javascript
// File Undoable.js
let _data = initialData;
let _past = [];
let _future = [];
function Undoable() {
}  
Undoable.prototype.update = function () {}
Undoable.prototype.undo = function () {}
Undoable.prototype.redo = function () {}
```

```javascript
// File lain misal index.js
import Undoable from './Undoable';

const item = new Undoable(5);
console.log(item.value)
// 5;
item.update(6);
item.value = 7;
console.log(item.value)
// 6
```



nah dengan gitu si prototype nya ini bisa ngakses local (file) variabel nya. itu saya bikin interface nya aja ya, mager nulis impelementasi lengkapnya, ya kurang lebih sama aja lah mekanismenya kaya yang sebelumnya.

masih penasaran bedanya prototype dan object property ? see you in next article.