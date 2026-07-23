---
title: >-
  Hal-Hal yang Saya Pelajari Saat Mengembangkan Express-Kun (Backend Helpers
  untuk pengembangan aplikasi express)
description: >-
  Saya belajar satu-dua hal saat mengembangkan Express-Kun (Backend Helpers
  untuk pengembangan aplikasi express). Ini akan menjadi seri yang membahasnya
publishedAt: '2020-02-21T20:49:52Z'
locale: id
translationKey: >-
  things-i-learned-while-developing-express-kun-backend-helpers-for-express-app-development-j44
tags:
  - JavaScript
  - Express
  - Backend
draft: false
canonicalUrl: >-
  https://dev.to/hanipcode/things-i-learned-while-developing-express-kun-backend-helpers-for-express-app-development-j44
originalLocale: en
sourceHash: 2e253622fd536305
---
## [](#intro)Pendahuluan

Hai semuanya, beberapa waktu lalu saya mengembangkan library yang bertujuan mempermudah pengembangan backend. Saya tidak ingin membuat framework, saya hanya ingin membuat sesuatu seperti lodash, tetapi khusus untuk pengembangan backend. Jadi, saya membuat express-kun, sebuah library yang menyediakan sekumpulan helper dengan pendekatan functional programming. Konsepnya sederhana, misalnya kalau ingin membuat middleware yang reusable, kita cukup memasukkan router, lalu hasilnya akan dikembalikan sebagai `midlewared router`. Contoh lainnya bisa dilihat di dokumentasinya di sini [https://github.com/hanipcode/express-kun](https://github.com/hanipcode/express-kun)

## [](#about-this-series)Tentang seri ini

Awalnya saya kira implementasi library ini akan sangat mudah. Ternyata saya salah besar, mungkin karena pengetahuan saya tentang JavaScript masih kurang, terutama soal sifat prototypal-nya. Saya pun ingin mendokumentasikan prosesnya, jadi saya menulis seri ini. Mari kita mulai dari hambatan pertama

### [](#things-i-just-know-about-express-gt-routerget-is-not-calling-a-get-in-the-router-class-directly-but-it-use-a-route-object-rotuer-different-than-route)Hal yang baru saya ketahui tentang express -> router.get tidak memanggil get di class router secara langsung, tetapi menggunakan object route (Router berbeda dengan Route).

Serius, ini cukup menohok saya. Sampai sekarang, meskipun sudah menghabiskan waktu berjam-jam membaca source code Router milik express, saya masih belum memahami bagaimana implementasinya. Pemahaman saya baru menyentuh permukaannya saja.

Saya kira library ini akan sangat sederhana. Saya pikir saya hanya perlu mengimplementasikannya dengan mengganti `router.get` dengan function lain seperti ini (akan saya sederhanakan, tetapi kalian bisa membaca source code-nya di repo yang saya tautkan di atas)  

```javascript
withMiddleware(router, middleware) {
 router.get = function(path, ...handlers) {
   router.get(path, middleware, handlers)
 }
 // other method more or less the same..
 return router;
}
```

tetapi saya mendapat error ini  

```text
 var __spreadArrays = (this && this.__spreadArrays) || function () {
                                                               ^

RangeError: Maximum call stack size exceeded
```

Sebenarnya saya ceroboh. Kalau dipikir-pikir, code sebelumnya akan menyebabkan infinite recursion. Jadi, setelah terkena error ini, saya memeriksa source code Router milik express ([https://github.com/expressjs/express/blob/master/lib/router/index.js](https://github.com/expressjs/express/blob/master/lib/router/index.js)). Coba lihat baris 507 - 513.  

```javascript
methods.concat('all').forEach(function(method){
  proto[method] = function(path){
    var route = this.route(path)
    route[method].apply(route, slice.call(arguments, 1));
    return this;
  };
});
```

methods adalah package npm yang mencantumkan method HTTP yang tersedia. Lalu code-nya cukup melakukan loop pada nama-nama method tersebut. dan  

```javascript
  proto[method] = function(path){
    var route = this.route(path)
    route[method].apply(route, slice.call(arguments, 1));
    return this;
  };
```

ini bagian yang menarik. Jadi, untuk sebuah object router, code tersebut membuat handler bagi setiap method HTTP. Namun, handler itu sebenarnya menerapkan sebuah method pada object route (ingat bahwa Router dan Route berbeda). Setiap router memiliki object route. (Source code route bisa dilihat di sini [https://github.com/expressjs/express/blob/master/lib/router/route.js](https://github.com/expressjs/express/blob/master/lib/router/route.js)).  
Di sinilah saya merasa makin ceroboh. Setelah mengetahui hal itu, saya tidak langsung memilih jawaban yang sudah jelas, tetapi malah membuat kesalahan kedua:

### [](#things-i-just-know-about-express-gt-router-does-not-return-a-plain-object-but-instead-a-callable-function-but-with-property)Hal yang baru saya ketahui tentang express -> Router() tidak mengembalikan plain object, tetapi sebuah function dengan property yang bisa dipanggil.

Untuk mengujinya, kalian bisa menulis sesuatu seperti ini. Nantinya akan terlihat bahwa router bisa dipanggil sebagai function yang merupakan shorthand untuk router.use  

```javascript
const router = new Router();
router(yourMiddleware);
```

Saya mengetahui ini karena pada percobaan kedua, saya mencoba mengganti method get dari .get dan seterusnya seperti di bawah ini  

```javascript
withMiddleware(router, middleware) {
 const routeObject = {};
 routeObject.get = function(path, ...handlers) {
   router.get(path, middleware, handlers)
 }
 // other method more or less the same..
 return {
   ...router,
   ...routeObject
 };
}
```

Sebenarnya ini sempat berfungsi, sungguh. Namun, masalahnya muncul saat kita ingin membagi beberapa endpoint ke beberapa router. Misalnya, kalau kita punya `routes.js` seperti di bawah ini  

```javascript
import userRouter from './modules/user/user.routes';
import postRouter from './modules/post/post.routes';

const apiRouter = Router();

apiRouter.use('/users', userRouter);
apiRouter.use('/posts', postRouter);
```

lalu di post.routes kita  

```css
const router = Router();
const errorHandledRouter = withErrorHandler(router, errorHandlerMiddleware);
const protectedRouter = withAuthMiddleware(errorHandledRouter);

protectedRouter.get('/', postController.getAll);
protectedRouter.post('/', postController.create);
protectedRouter.get('/:postId', postController.getPost);
protectedRouter.get('/:postId/comments', postController.getComments);
protectedRouter.post('/:postId/comments', postController.comment);
// other route

export default protectedRouter;
```

saya terkena error:  

```text
TypeError: Router.use() requires a middleware function but got a Object
    at Function.use (/Users/hanif/Projects/express-kun-example/node_modules/express/lib/router/index.js:458:13)
```

yup. Error-nya terjadi di `apiRouter.use('/posts', postRouter)`. karena postRouter adalah sesuatu yang dikembalikan oleh withMiddleware dan bukan benar-benar function router. Itu adalah object yang dibuat dengan spread operator. Itulah masalahnya. Sebenarnya ada workaround untuk membuat post.routes seperti di bawah ini  

```css
const router = Router();
const errorHandledRouter = withErrorHandler(router, errorHandlerMiddleware);
const protectedRouter = withAuthMiddleware(errorHandledRouter);

protectedRouter.get('/', postController.getAll);
protectedRouter.post('/', postController.create);
protectedRouter.get('/:postId', postController.getPost);
protectedRouter.get('/:postId/comments', postController.getComments);
protectedRouter.post('/:postId/comments', postController.comment);
// other route

export default router;
```

kita tetap mengekspor router utama. Namun, setiap router akan tetap terdaftar karena withMiddleware sebenarnya hanya mendaftarkan middleware di dalam router tersebut. Tetapi cara ini sangat tidak intuitif dan saya tidak ingin library saya membingungkan.

akhirnya saya sampai pada solusi yang sudah jelas:  

```css
export default function withMiddleware(
  router: Router,
  middlewares: SupportedMiddleware
): Router {
  let connectedMiddleware: RequestHandler[];
  if (isMiddlewareArray(middlewares)) {
    connectedMiddleware = middlewares;
  } else {
    connectedMiddleware = [middlewares];
  }

  router.get = function(path: PathParams, ...handlers: RequestHandler[]) {
    const route = this.route(path);
    route.get.apply(route, [...connectedMiddleware, ...handlers]);
    return this;
  };

  router.post = function(path: PathParams, ...handlers: RequestHandler[]) {
    const route = this.route(path);
    route.post.apply(route, [...connectedMiddleware, ...handlers]);
    return this;
  };

  router.put = function(path: PathParams, ...handlers: RequestHandler[]) {
    const route = this.route(path);
    route.put.apply(route, [...connectedMiddleware, ...handlers]);
    return this;
  };

  router.delete = function(path: PathParams, ...handlers: RequestHandler[]) {
    const route = this.route(path);
    route.delete.apply(route, [...connectedMiddleware, ...handlers]);
    return this;
  };

  return router;
}
```

code di atas adalah code yang saat ini ada di repo. Di sini terlihat bahwa saya menggunakan function biasa, bukan arrow function. Dengan begitu, saya masih bisa mendapatkan nilai 'this' dari router. Lalu, saya memasukkan method tersebut ke dalam object route. Sebenarnya ini hanya memodifikasi code berikut dari codebase express  

```javascript
  proto[method] = function(path){
    var route = this.route(path)
    route[method].apply(route, slice.call(arguments, 1));
    return this;
  };
```

## [](#outro)Penutup

baiklah, itulah hambatan konyol yang saya alami saat mengembangkan library `express-kun` saya. Kalau kalian bisa belajar satu-dua hal dari sini, bagus sekali. Dan kalau kalian menyukai konsep library ini, silakan mencobanya. Terima kasih!
