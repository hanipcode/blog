---
title: "FP di JS: Apa Itu Functor"
date: 2020-10-04T10:13:27+07:00
draft: true
toc: false
images:
cover: "img/2.jpg"
tags:
  - untagged
---
## Intro

Untuk beberapa waktu kedepan saya akan menuliskan series tentang FP / Functional Programming. Terutama dari perspektif frontend. Dalam proses menjelaskan functional programming kali ini saya akan menggunakan metode deduktif dimana kita akan membahas poin poin atau hal penting dalam fungsional programming sebelum akhirnya berbicara tentang FP secara keseluruhan. pada bagian kali ini, mari berbicara tentang Pure Function



## Apa Itu Pure Function

Oke jadi pertama kita akan membahas tentang hal yang cukup simpel, yaitu pure function. Ada beberapa ciri dari pure function, seperti dibawah ini.

### Output akan selalu sama jika input tidak berubah

{{<mermaid>}}
graph TD;
Input-->Fungsi
Fungsi-->Output
{{</mermaid>}}

Pure function pada dasarnya adalah seperti mesin dalam pabrik, yang selalu konsisten menghasilkan output yang sama, selama input (bahan) nya juga tidak berubah. Katakanlah fungsi dibawah ini:

```javascript
function double(x) {
  return x*x;
}
```

misalkan kita run fungsi tersebut berkali-kalipun jika input nya sama akan selalu menghasilkan nilai yang sama:

```javascript
console.log(double(5));
// 25
console.log(double(5));
// 25
console.log(double(5));
// 25
console.log(double(5));
// 25
```

### Pure Function tidak memiliki side effects

Side Effects adalah ketika sebuah fungsi mengubah nilai dari variabel lain di fungsi tersebut. contoh:

```javascript
let x = 5;
function double() {
  x = x * x;
  return x;
}
```

fungsi tersebut merubah nilai x pada variable luar nya. ini juga membuat fungsi tersebut memiliki output yang berubah berubah ketika dipanggil berulang padahal input (dalam hal ini input nya adalah kosong) nya tidak berubah.

```javascript
console.log(double());
// 25
console.log(double());
// 625
```

