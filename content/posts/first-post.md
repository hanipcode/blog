---
title: "Blog baru dan kenapa pindah static site"
date: 2021-01-15T17:21:04+07:00
draft: false
toc: false
images:
cover: "img/1.jpg"
tags:
  - hugo
  - static site
  - about me
---

## Rumah baru

sebelum ini website saya di host dengan stack vps digital ocean dan blogging platform Ghost.
Kali ini saya menggunakan stack yang agak berbeda karena saya memilih jalur static site.

{{<rawhtml>}}

<iframe src="https://designfiles.co/embeds/boards/154796" id="df-embed-iframe"  width="100%"  style="border:none;margin: 0 auto; self-align: center; text-align: center; width: 100%; height: fit-content; display: block; max-width: 100%">
</iframe>
<script>
function resizeHeight() {
  const el = document.getElementById("df-embed-iframe");
  const curWidth = el.clientWidth;
  const toRatio = (3/4) * curWidth;
  const PROJECT_NAME_HEIGHT = 50;
  document.getElementById("df-embed-iframe").style.height = `${toRatio + PROJECT_NAME_HEIGHT}px`;
}
resizeHeight();
window.addEventListener('resize', resizeHeight);
</script>
{{</rawhtml>}}

## Mengapa pindah ?

ada beberapa alasan sih. alasan sok keren nya > _belajar stack baru_. padahal sih...

```
tekor bos bayar digital ocean tiap bulan 5$
```

apalagi dimasa pandemi begini, sungguh uang segitu lebih baik untuk makan. lalu stack apa neh
yang kemudian memungkinkan untuk maintain blog pribadi dan tetep bisa makan? mari kita bahas stack nya

## Blog Stack

### Frontend(?): Hugo

Blog ini menggunakan Hugo, seebuah static page generator. ya mirip gatsby juga atau jekyll seh kalau gasalah. but IMHO, jauh lebih simpel. well satu yang aku suka dari hugo ini sih dibanding sebelumnya pake Ghost, dia nulisnya pake markdown, dan ga ribet perlu login login segala, tinggal nulis di local pake markdown, push, beres dah.
Udah gitu by default udah banyak banget tema nya juga sih, dan nginstall tema nya cukup perlu clone haha. overall blog ini di setup mungkin 2-3 jam aja udah sama urusan domain.

### Hosting(?): Netlify + Github

Yap. blog ini cuma saya taruh di github, yaudah lah ya biar open source aja toh jadi memotong biiaya ga perlu bayar server bulanan. kalau ga percaya, blog saya bisa dikunjungi dimari: https://github.com/hanipcode/blog . dan untuk Continous Deployment nya saya pake Netlify.. yang gratis tentunya.

## Ngomongin Pro and Cons

Okeh, ngomongin keuntungan dan kerugian sekarang.
Kalau dari sisi keuntungan yang langsung ku rasa sih ini membuat bikin website jadi lebih murah. cukup beli domain nya aja, bahkan kalau mau pake subdomain nya netlify atau subdomain nya github mungkin bisa jadi gratis.

Pros lainya adalah ditulis pake markdown. jadi gampang aja kalau sewaktu-waktu mau gw pindahin ke Dev.to misalnya, atau mau ganti static generator lain. rata-rata static generator lain toh juga support pake markdown.

Another pro mungkin dari hugo nya sendiri ini cocok buat programmre karena udah dilengkapi syntax highlighting. dulu waktu setup di Ghost lumayan ribet sih. contoh

```javascript
function testJSFunction() {
  return true;
}
```

Gaul emang nih hugo buat programmer mah, by default lgsg support syntax highlighting

Cons nya, mungkin lebih ke dari sisi scaling ya, gak ideal lah untuk website yang terlalu kompleks.
dan juga kayanya bakal nanti kepentok scaling issue di netlify nya. versi gratis cuma dapet bandiwdth 300GB/month. buat blog ya no problem sih gue rasa.

tapi kalau buat web yang lebih kompleks perlu mikir lagi. dan kampret nya adalah provider macam netlify dan firebase ini ngasih gratisan nya baik tapi begitu udah lewatn fair usage nya bisa tau-tau jadi mahal.

Anda tertarik nyoba static site ? tertarik kah ketika misal saya buat tutorial untuk implement stack semacam ini ?
