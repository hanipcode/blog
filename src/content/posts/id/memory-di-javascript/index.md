---
title: Memory di Javascript
description: tiga kata lucu sih ini.
publishedAt: '2025-10-14T16:23:29.939Z'
locale: id
translationKey: memory-di-javascript
tags:
  - JavaScript
  - Performance
draft: false
canonicalUrl: 'https://hanipcode.substack.com/p/memory-di-javascript'
---
cuma sekedar opini.

tapi harusnya orang belajar ngoding itu dari backend atau malah kalau bisa sekalian system programming (makanya termasuk setuju kalau kuliah mulai dari bahasa kaya c++/c).

karena banyak banget hal essential di backend yang kalau di backend itu “wajib” di frontend kadang dibolehin buat di skip.

contoh kayak memory, kalau di backend memory ini cost nya di sisi si programmer, kayak server cost. tapi kalau di frontend “cost” nya di sisi user. dan jadi sering dianggap kayak “kan computer sekarang udah canggih canggih”.

dan sebenrenya juga bukan karena ga ada atau ga bisa dipelajari. di browser juga ada stack sama heap. dan kalau oversimplifikasi bisa aja nganggep setiap object di js ini, yang di assign ke variable nya itu pointer ke memory di heap. jadi. kalau didalem loop itu kita ngelakuin

```javascript
const newObj = {...oldObj, newKey: “something” } 
```

itu sama aja kayak bikin object baru di heap, sejumlah N loop nya, dan btw array juga termasuk “object” di javascript.

jadi kadang, meskipun ga selalu, tapi kalau kamu ngerasa app mu makan banyak memory dan butuh optimization. cari loop yang paling gede dan paling banyak bikin object. lakukan 2 hal

1.  kalau itu pake .map .filter .reduce dan dot dot lain, ubah ke \`boomer loop\` dulu alias simple \`for\` loop.
    
2.  daripada bikin object baru, kalau bisa ngelakuin mutate, bisa jadi mutate lebih baik.
    
3.  daripada ngecopy object kadang cukup ambil data yang kita butuh aja dan bikin object baru dari itu aja. misal
    

```javascript
const Rect = {x,y,width,height, boundingBox}

// terus kita mau lakuin sesuatu dengan x y, bikin aja object Point
const Point = { x: Rect.x, y: Rect.y }
// baru lakuin kalkulasi
calculateSomething(Point)
```

selain buat nyimpen simpel primitive kaya boolean atau number, stack di javascript ini mostly buat nyimpen execution context

apa sih execution context? jadi buat javascript tau, misal di suatu line dia nge eksekusi

```javascript
const a = x+ y;
```

buat dia tau x sama y ini darimana gimana? jadi setiap kita bikin function di javascript itu kita bikin yang namanya execution context, yang isinya kayak parameter, local variable dalem function itu, reference ke outer scope dan lain lain termasuk “this” object. semuanya di set dulu baru dijalanin line by line. makanya ketika nge run line dengan content x+y di atas si js udah tau x , y ini refer kemana.

lah terus gimana kalau di global? sama aja, pertama browser nge load page dia bakal bikin global execution context yang kurang lebih sama isinya kaya execution function tadi. makanya kalau di top level / di global kamu nyoba

```javascript
console.log(this)
```

itu ada isinya kan? isinya ya window object. jadi gampangnya bisa kamu bayangin kalau si Engine nya javascript ini juga sebuah function yang ngelakuin hal yang sama. yah anggap aja javascript ini kayak function dalam function.

nah tadi kan kita udah bahas nih kalau si javascript ini dari awal execution context, kayak waktu bikin execution context dia simpen juga reference reference yang dia butuhin kayak argument si function, variable, dll.

jadi waktu dia nge run suatu line di javascript dia udah tau harus refer itu variable ke mana, karena di setiap awal execution context ini javascript bakal nge bikin declration dulu semua variabelnya yang ada di dalem execution context itu.

tapi kok kita bisa dapet error macem begini?

![](https://substackcdn.com/image/fetch/$s_!c77-!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa2d289fb-6e08-436b-9ebe-6cc1b8be6fee_786x75.png)

pertama, karena kalau declaration sama definition/initialization itu dua hal berbeda.

declaration itu cuma kayak kita bilang ke komputer “nanti bambang bakal dateng ke ruangan ini”. jadi informasi yang si komputer punya sebatas “bakal ada orang namanya bambang”. kalau kita suruh komputer buat nyuruh bambang bikin mie, sebelum bambang dateng, komputer ini bingung “lah bambang yang mana”.

Definition itu ketika kita suruh bambang masuk dan kita kenalin ke komputer, ini lho bambang. dan si komputer jadi bisa nyuruh bambang bikin mie.

balik ke error di screenshoot. makanya error nya bisa dibaca “mencoba nge akses variable yang udah di declare tapi belum di define/initialize”. kalau kita coba pikir lebih jauh, kalau waktu di line c= c\*5 ini si browser sama sekali belum tau c, harusnya c undefined kan? bukan error kayak di atas..

nah jadi semua variable dan function di javascript ini bakal di declare di atas, inilah yang di sebut hoisted.

cuma, khusus untuk function, dia gak cuma di declare, tapi juga di define di atas. makanya ini gak error

![](https://substackcdn.com/image/fetch/$s_!4zwr!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8083a089-e7f5-409e-82b5-f38b7de4e640_436x66.png)

function di javascript bisa dipake dimana aja bahkan ketika secara posisi di code itu diatas. tapi ini cuma berlaku buat function biasa ya yang kayak

```javascript
function gas(w) { console.log(w)  }
```

kalau ini gak

```javascript
const gas = function(w) { console.log(w)}
```

gak percaya? nih

![](https://substackcdn.com/image/fetch/$s_!8Dcd!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa06f92bc-fe86-4427-bc2b-8a1fe496eeed_729x88.png)

gampangnya, function ini memang di perlakukan spesial di javascript, kalau menurut saya karena historical reason dan backward compatibility.

jadi di javascript dulu orang naruh <script> tag itu dibawah body kan. karena parsing html browser yang top down dan DOM baru bisa diakses setelah <body> ke parse. dan mereka misal nulis

```jsx
<button onclick="someFunction">
```

nah button ini di body , script nya dibawah. kalau waktu JS ini ngenalin lexical scope (topik for another day) ini juga di fix. bakal ada banyak web web jadul yang nge break.

nah sekarang kok bisa script2 framework modern kayak react di taruh di atas body tapi jalan? karena sekarang di script tag kita bisa nambah \`defer\` atau bikin type nya \`module\` yang artinya script itu bakal di load setelah DOM selesai di load, biasanya bundler bundler, terutama kalau export nya ke client only / SPA bakal nambahin. jadi kayak

```javascript
<script type="module" src="./bundle.js></script>
```

nah terus apa yang terjadi nih setelah stack execution context atau stack frame ini ditaruh di stack.

mungkin bahas stack dulu. stack ini kayak anggep aja sebuah baris memory, atau kalau mau oversimplifikasi anggep aja array.

bedanya kalau baris memory heap ini disimpan di RAM, stack ini disimpan di CPU, jadi stack ini lebih kecil memory nya dari heap, tapi akses nya lebih cepat.

tadi juga udah sempet dibilang kan primitve disimpan di stack, dan object itu akan disimpan di heap, kemudian pointer nya yang disimpan di stack jadi misal ada kode kayak dibawah

```javascript
let x = 5;
let y = 6;
const point = { x, y}
```

yang javascript lakukan adalah

simpan x = 5 di stack memory

simpan y = 6 distack memory

karena point ini non primitve dan object, bikin object { x, y} di heap

simpan point = (pointer / address {x,y} di heap tadi) di stack memory

kalau di bahasa lain yang support pointer ini sama aja kayaksama kayak

p = Point{ x, y}

point = \*p

nah terus mari bahas kode dibawah

```javascript
let x= 5;
let y= 6;
let point = {x, y}
x = 6;
```

ketika si stack ini udah sampe nge eksekusi x = 6, kira kira apa value dari \`point\` ?

value nya akan berisi { x: 5, y: 6 } seperti dibawah

![](https://substackcdn.com/image/fetch/$s_!ANcb!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe433b93f-e76f-4dfe-81a8-a414bd451e42_316x177.png)

kenapa ? karena balik lagi ke rule nya, primitive itu di store langsung sebagai value nya di stack. dan makanya ketika dipake / di pass ke object itu, tentu aja yang di pass juga value nya. atau istilahnya copy by value.

gimana kalau ini

```javascript
let point1 = {x: 5, y: 6}
let point2 = point1
let rect = {point: point1, width: 50, height: 60};
point1 = {x: 6, y: 7}
console.log(point1)
console.log(point2)
console.log(rect)
```

apa outputnya?

![](https://substackcdn.com/image/fetch/$s_!EUZZ!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F79dc64ff-fc97-4d85-8b25-da0f2d3d1abd_396x221.png)

kuncinya adalah address ini juga bisa dianggap “primitive” dan behavior nya sama kyak primitive lain yang mana dia copy by value

singkat nya, si point 1 ini jadi {6,7} tapi rect.point sama point2 kok masih {5,6} ? mari kita cosplay jadi stack dan coba uraikan prosesnya

line 1

bikin object {x: 5, y: 6} di heap, kemudian simpan point1 = address di stack

line 2

ingat kalau di stack kita udah punya point1 = address object yang dibuat di heap

makanya point2=point1 ini sama kayak ambil value point 1, yang mana adress object tadi di,

copy value nya ke point2 (karena primitive copy by value)

line 3

sama kayak tadi, pertama ambil value point1 dari stack, yang mana address object {x: 5, y:6} tadi di heap.

bikin object baru di heap yang isinya

{point: \*address object {x:5,y:6} awal tadi di heap\*, width: 50, height: 60}

set rect = address object diatas barrusan ke stack.

line 4

bikin object baru di heap {x: 6, y: 7}

reassign point1 = address object {x:6,y:7} diatas

jadi, yang di replace di line 4 ini bukan object itu sendiri, karena itu ada di heap, melainkan value dari point1 ini yang diganti. dari tadinya pointer ke {x: 5, y:6} di heap ke pointer {x: 6, y:7} di heap.

nah, ingat, address itu di treat seperti primitive value, makanya waktu di line 2, dan 3, dia di copy dan di assign valuenya di ke point2, dan juga ke rect.point.

kalau memudahakan kita bisa mikir bahwa stack ini cuma bisa untuk menyimpan primitive dan address ini termasuk primitive seperti number, boolean, dll. dan di stack, karena dia memorynya kecil, yang terjadi ketika mengganti variable adalah dia akan menghapus value yang lama.

Nah karena langsung dihapus, biar kode kayak dibawah

```javascript
let a = 5;
let b = a;
```

itu ga broken. yang dilakukan ketika mengeksekusi b = a adalah value 5 ini akan di copy dan dimasukan ke dalam b. alias 5 didalem a dan 5 didalem b ini addressnya beda. jadi kalau ketika di reassign dan value 5 yang didalem a ini dihapus, ya ga masalah.

nah sekarang konek kan konsep itu dengan, setiap non-primitive di javascript kayak object point diatas itu disimpan didalam Heap, dan ketika dimasukan ke variable, yang disimpan didalam variable itu adalah pointer atau address dari object tersebut di heap. makanya ketika kita lakuin

```javascript
let point2 = point1
```

karena address ini primitive, address yang ada di point1 ini bakal di copy, dan di assign ke point2. makanya ketika

```javascript
let point1 = { x: 6, y: 7}
```

point1 ini bakal direplace value nya ke address dari object baru {x: 6, y:7} di heap. tapi point2 ini ga pengaruh, karena sebelumya yang di assign ke point2 adalah address dari {x:5 y: 6} di heap, dan ini di assign dengan di copy value address nya tadi. ingat ya cuma value addressnya, bukan objectnya itu sendiri.

nah kalau value di stack ini kan setiap variable di reassign akan di hapus kayak

```javascript
let x =5;
x=6
```

nah beda lagi kasusnya kalau

```javascript
let point1 = {x: 5 , y:6}
let point2 = point1
point1.x = 6
console.log(point1)
console.log(point2)
```

![](https://substackcdn.com/image/fetch/$s_!aNjq!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7be474dc-33ec-4dc6-a941-383907f44872_286x132.png)

kok bisa point2 ikut berubah? yok line by line lagi

line 1

bikin {x:5, y:6} di heap. assign value address nya ke point1

line 2

ambil value address dari point1, copy dan reassign ke point2 (disini point1 dan point2 akan refer ke value/memory yang sama di heap)

line 3

point1.x ini bisa kita bayangkan dengan akses object dengan address di point1 di heap {x:5, y:6} .

ubah nilai x dari object tersebut ke 6

nah karena balik lagi, setiap kita passing object di js ini yang di passing adalah address nya di heap. dan point1 sama point2 ini refer ke object di memory address yang sama, makanya seolah value point2 ini berubah. padahal yang sebenernya berubah adalah nilai x dari object {x, y} di heap.

oke kita udah bahas, setiap value ga dipake kayak misal variable di reassign di stack itu value nya di hapus. gimana dengan di heap? kan kalau address di reassign gak boleh dong dihapus, seperti di contoh sebelumnya,

```javascript
let point1 = {x: 5, y: 6}
let point2 = point1
let rect = {point: point1, width: 50, height: 60};
point1 = {x: 6, y: 7} << line 4
console.log(point1)
console.log(point2)
console.log(rect)
```

ketika point1 ini di assign memory address baru di line 4 (object {x: 6,y:7}) kita ga boleh dong delete object {x:5, y:6}. karena nanti kalau point2 di akses, atau rect.point di akses, memory di heap nya udah dihapus. kalau di C istilahnya dangling pointer. alias pointer yang address nya masih disimpan padahal memorynya udah di free/hapus

terus gimana kalau object di heap itu udah ga bener bener dipake? kayak misal

```javascript
let point1= {x: 5, y:6}
let point2 = point1
point1 = {x: 6, y:7}
point2 = {x: 7, y:8} <<< line 4
```

ketika di line 4 ini, object {x:5, y:6} di heap address nya udah ga ada dimanapun di stack dong ? (karena setiap reassign value di stack dihapus). kalau object nya di heap ga di hapus juga jadi memory leak dong? alias kebalikanya dangling pointer tadi. kalau ini, address nya dah ga dipake dimana mana di stack, tapi memorynya masih ada.

nah disinilah ada yang namanya Garbage Collector. jadi tugasnya garbage collector ini adalah mencari memory memory yang address nya udah gak terpakai tadi, dan dihapus dari heap. Garbage collector ini ada cycle nya otomatis dari browser tanpa kita perlu running sendiri.

nah apa yang terjadi kalau kita bikin dan hapus memory yang besar dalam waktu cepat. contoh yang kita bahas di atas soal bikin object baru di dalam loop ? tentu saja kita bikin tugas si Garbage Collector ini makin berat, ini yang disebut GC Pressure yang mana jadi berefek ke CPU juga.

jadi begitulah, ga nyangka, awalnya iseng bahas memory di javascript tapi udah yapping sepanjang ini . sebenernya kita beleum selesai. kita belum bahas apa yang terjadi saat nge run function misalnya.

tapi yah gak yakin juga ada peminatnya, jadi ya sudahlah segini saja dulu. mungkin bisa komen ya kalau kamu pengen pembahasan ini di lanjut!
