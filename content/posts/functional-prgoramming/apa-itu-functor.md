---
title: "FP di JS: Apa Itu Functor"
date: 2020-10-04T10:13:27+07:00
draft: false
toc: false
images:
cover: "img/2.jpg"
tags:
  - untagged
---

# FP di JS: APA ITU FUNCTOR

Jadi pada artikel kali ini kita akan ngomongin soal Functor nih. kalau kalian belajar functional programming, pasti sekali dua akan ketemu dengan istilah yang satu ini. saya sendiri baru dapet "eureka" moment saya kemarin tentang apa sih sebenernya functor ini. karena istilah istilah functional programming ini suka ribet ribet makanya sering kali susah dipahami dan ga aksesibel. misalnya definisi formal nya Functor ini apa coba? mari kita cek wikipedia:

> In [functional programming](https://en.wikipedia.org/wiki/Functional_programming), a **functor** is a [design pattern](https://en.wikipedia.org/wiki/Design_pattern) inspired by [the definition from category theory](https://en.wikipedia.org/wiki/Functor), that allows for a [generic type](https://en.wikipedia.org/wiki/Generic_type) to apply a [function](https://en.wikipedia.org/wiki/Function_(mathematics)) inside without changing the structure of the generic type.

nah loh, nyari definisi sesuatu, eh malah ketemunya sama sesuatu yang ga kita tau lagi definisinya apa. category theory itu sih kalau ga salah dari teori matematika. tapi siapa sih yang punya waktu belajar math cuma buat paham konsep di pemrograman. 

Tapi bukan berarti Functor ini cuma makhluk astral yang tidak praktikal ya, bahkan sebenernya sehari hari pasti kita udah pernah pake yang namanya Functor. ga percaya ? sehari hari ngoding JS pake Array kan ? ya Array itu Functor.

Ini salah satu bukti sebenernya kita gak perlu tau teori buat bisa pake konsepnya di dunia nyata, tapi memahami konsep bikin kita bisa lebih mengeksplor dan bahkan mengaplikasikan konsep itu untuk hal lain. jadi mari kita coba memahami Functor.

Kalau menurut saya, sebenernya definisi paling simpel Functor adalah:

> Struktur (atau tipe) data yang bisa di map

simpel kan ? Array bisa di map gak ? Bisa. yaudah, array itu Functor, sesimpel itu. Tapi apa sih sebenernya mapping itu ?

##  Mapping

okeh, jadi Functor itu struktur data yang bisa di map kayak array. tapi apa sih sebenernya proses Mapping itu ?

Sebagian orang yang pernah saya tanya bilang kalau Mapping itu merubah data ke data lain. hemm agak kurang tepat sih. karena bahasa lain nya "merubah" di programming itu kan "mutating" ya. sedangkan di kitab suci FP mutasi data adalah sesuatu yang diharamkan yang bisa bikin murtad dari FP. 

Kalau kita amati di dalam javascript pun, `Array.prototype.map` gak merubah nilai dari si Array tersebut. contoh:

```javascript
const initialArr = [1, 3, 5];
initialArr.map(v => v * 2);
console.log(initialArr);
// [1, 3, 5]
```

yak, nilai dari `initialArr` ini gak berubah berubah kan. makanya kalau kita mau pakai value yang di map ini kita harus assign variabel baru kayak dibawah

```javascript
const initialArr = [1, 3, 5];
const doubledArr = initialArr.map(v => v * 2);
console.log(doubledArr);
// [2, 6, 10]
```

jadi enaknya Mapping ini disebut apa ? kalau buat saya sih simpel aja ya, di translate aja, jadi "memetakan". 

Bayangkan misal `initialArr` ini ada di sebuah garis bilangan A.

{{<mermaid>}}

graph LR;

1---3

3---5

{{</mermaid>}}

mapping ini berarti kita memetakan garis bilangan ini ke garis bilangan baru. nah untuk memetakan butuh aturan nya dong, mau dipetakan kayak gimana nih ? `Function` yang jadi parameter dari `.map`itu lah yang menentukan aturan nya. misal kalau di kasus code seperti diatas, aturan nya adalah kita memetakan garis bilangan `initialArr`, ke garis bilangan baru dimana setiap nilai pada `initialArr` akan dipetakan ke nilai-dua-kali-lipat-dirinya di garis bilangan baru tersebut.

{{<mermaid>}}

graph TB;

1-->2

3-->4

5-->6

{{</mermaid>}}

Penggunaan tipe data `number` atau `integer` ini hanya untuk mempersimpel pemahaman ya, tapi tentu aja kita bisa melakukan banyak hal lain dengan `.map`. tapi poin penting nya adalah `mapping` tidak merubah apapun baik struktur maupun nilai dari struktur data yang di `map`, melainkan `membuat garis bilangan baru` yang tentu saja garis bilangan baru itu bisa kita assign ke variabel baru.

## Membuat Struktur Data Functor Sendiri

Kalau di JS ada Array, terus setelah tau tentang Functor, buat apa ?

Tentu saja buat mengaplikasikan konsep tersebut ke hal lain. Contoh kita sedang membuat aplikasi game, untuk mempermudah tracking score ayo kita bikin struktur data dengan nama `ScoreList`. dan kita buat ScoreList ini menjadi sebuah Functor sehingga kita dapat memetakan score dari para player dengan mudah:

```javascript
/*
  Function Score List value accept the following structure
  {
    [personName: string]: score
  }
*/
function ScoreList(value) {
   this.value = value;
}

ScoreList.prototype.map = function(fn) {
  const personKeys = Object.keys(this.value);
  const result = {};
  personKeys.forEach(name => {
     result[name] = fn(this.value[name]);
  });
  return result;
}
```

mari kita tes:

```javascript
const scores = new ScoreList({
  me: 10,
  you: 20,
  him: 30,
})

const doubleScore = (x) => x * 2;
const multipliedScore = (multiplier) => (x) => x * multiplier;

console.log(scores.map(doubleScore));
/*
{
  him: 60,
  me: 20,
  you: 40
}
*/
console.log(scores.map(multipliedScore(5)))
/* 
{
  him: 150,
  me: 50,
  you: 100
}
*/
console.log(scores.value);
/*
{
  him: 10,
  me: 20,
  you: 30
}
*/
```

nah disini kita dapat dengan mudah memetakan nilai score dari masing masing player ke nilai baru. tanpa merubah nilai dari variable `scores` itu sendiri. mungkin disini kalian akan mikir, ah ribet masa harus ngakses nya dari `scores.value`. dan juga nilai map dari fungsi map ini ga bisa di chain di map lagi kan ? I ya sih itu karena saya agak curang dikit si fungsi .map kita sekarang nge return nya `plain javascript object`bukan struktur data ScoreList yang kita buat itu sendiri. diatas saya buat seperti itu untuk lebih mudah memahami.

Sekarang mari kita extend struktur data kita supaya ga perlu lagi nih ngakses nya harus dari `scores.value` dan juga nilai dari `map` ini nge return `ScoreList` dan bisa di map lagi. awesome kan:

```javascript
/*
  Function Score List accept the following structure
  {
    [personName: string]: score
  }
*/
function ScoreList(value) {
   const keys = Object.keys(value);
   keys.forEach((key) => {
     this[key] = value[key];
   });
}

ScoreList.prototype.map = function(fn) {
  const personKeys = Object.keys(this);
  const result = {};
  personKeys.forEach(name => {
     result[name] = fn(this[name]);
  });
  return new ScoreList(result);
}

const scores = new ScoreList({
  me: 10,
  you: 20,
  him: 30,
})

const doubleScore = (x) => x * 2;
const multipliedScore = (multiplier) => (x) => x * multiplier;

console.log(scores.map(multipliedScore(5)));
/* 
{
  him: 150,
  me: 50,
  you: 100
}
*/
console.log(scores.map(doubleScore).map(doubleScore));
/*
{
  him: 120,
  me: 40,
  you: 80
}
*/
console.log(scores);
/*
{
  him: 10,
  me: 20,
  you: 30
}
*/

```

nah udah mantap kan ? disini kita langsung menyimpan nilai score seolah dia object biasa dan ga perlu ngakses dari property `.value`. dan udah gitu hasil dari `map` kita ngereturn tipe data ScoreList itu sendiri sehingga, ya bisa di map terus mau di chain sampai nge break memori juga bisa.

dengan membuat tipe data yang mappable seperti ini kita bisa melakukan pemetaan dan mendapat nilai berdasarkan fungsi tanpa merubah nilai asalnya. emang kenapa perlu gitu ? salah satunya adalah  cara seperti ini dapat meminimalisir bug dimana kita mau dapet nilai mapping tapi malah gak sengaja  ngubah nilai aslinya. dan juga dengan tidak merubah nilai asli kita bisa mempermudah debugging dan juga bikin fitur keren kayak `undo` secara gratis dan efisien.

Oh ya kalau kalian notice diatas saya pake salah satu konsep functional programming lagi untuk membuat fungsi `multipliedScore`. jadi di FP ini namanya `currying` atau `partial application` apa itu ? tunggu di artikel selanjutnya !