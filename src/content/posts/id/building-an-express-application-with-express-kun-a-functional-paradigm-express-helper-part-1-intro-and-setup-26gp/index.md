---
title: >-
  Membangun Aplikasi Express dengan Express-Kun, helper express berparadigma
  fungsional - Bagian 1 (Pengenalan dan Setup)
description: >-
  Di artikel ini, saya akan mencoba menjelaskan cara sederhana membangun
  aplikasi menggunakan helper yang saya buat
publishedAt: '2020-02-14T18:45:23Z'
locale: id
translationKey: >-
  building-an-express-application-with-express-kun-a-functional-paradigm-express-helper-part-1-intro-and-setup-26gp
tags:
  - TypeScript
  - Express
  - Backend
draft: false
canonicalUrl: >-
  https://dev.to/hanipcode/building-an-express-application-with-express-kun-a-functional-paradigm-express-helper-part-1-intro-and-setup-26gp
originalLocale: en
sourceHash: 06709bd69dfac09e
---
## [](#introduction)Pengenalan

Hari ini saya baru saja membuat library untuk express js. Library ini berisi helper express yang mengutamakan pendekatan fungsional untuk berbagai use case umum. Saya membuat library ini dengan mengambil inspirasi dari library frontend seperti Lodash atau redux.

Menurut saya, keindahan kedua library tersebut adalah keduanya hanya memperluas fungsionalitas tanpa mengganggu cara kita menulis aplikasi. Misalnya, saat menggunakan redux, redux tidak mendefinisikan ulang cara kita menulis react component. redux hanya perlu kita meneruskan component ke fungsi connect. Sementara itu, Lodash memudahkan kita melakukan berbagai hal umum.

Sepertinya saya belum menemukan framework/library semacam itu untuk express, yang tidak mengganggu atau mengubah cara saya menulis aplikasi. Jadi, saya membuat express-Kun ([https://github.com/hanipcode/express-kun](https://github.com/hanipcode/express-kun)).

Library ini cukup sederhana. Library ini melakukan salah satu dari 2 hal:

1.  Kita meneruskan router, lalu library mengembalikan router yang sudah dimodifikasi
2.  Kita meneruskan router dan middleware/error handler, lalu library mengembalikan callback dengan router yang sudah dimodifikasi sebagai parameternya.

ada beberapa fungsi dari express-kun yang akan kita gunakan dalam seri ini

#### [](#withmiddleware)withMiddleware

kita meneruskan router dan middleware, lalu fungsi ini akan mengembalikan router yang sudah dipasangi middleware  

```javascript
// your router
const router = Router();
// with auth middleware
const protectedRouter = withMiddleware(router, authMiddleware); // also support array of middleware ex: [authMiddleware, myMiddleware2]

protectedRouter.get("/user", (req, res) => {
  res.send({
    message: "success"
  });
});
```

karena fungsi ini hanya mengembalikan router yang sudah dipasangi middleware, kita bisa melakukan chaining tanpa mengubah perilaku router pertama  

```css
// your router
const router = Router();
// with auth middleware
const protectedRouter = withMiddleware(router, authMiddleware); // also support array of middleware ex: [authMiddleware, myMiddleware2]
// will apply authMiddleware and uploadMiddleware
const protectedUploadRouter = withMiddleware(protectedRouter, uploadMiddleware);

protectedRouter.get("/user", (req, res) => {
  res.send({
    message: "success"
  });
});
protectedUploadRouter.post("/user", (req, res) => {
  res.send({
    message: "success upload photo"
  });
}))
```

#### [](#witherrorhandler)withErrorHandler

kita meneruskan router dan error handler, lalu fungsi ini akan mengembalikan router. Jika salah satu handler mengembalikan error saat runtime, error tersebut akan diteruskan ke error handler  

```typescript
function errorHandler(err, req, res, next) {
  res.json({
    error: true,
    mesage: "wow error"
  });
}

const withErrorHandlerRoute = withErrorHandler(router, errorHandler);

// when accessed will return json { error: true, message: 'wow error' }
withErrorHandlerRoute.get("/errorrouter", (req: Request, res: Response) => {
  throw new Error("Error here");
});
```

ini menyediakan fungsionalitas lebih lanjut untuk menyusun middleware bersama error handler  

```typescript
function errorHandler(err, req, res, next) {
  res.json({
    error: true,
    mesage: "wow error"
  });
}

function middleware(req, res, next) {
  console.log("midleware");
  next();
}

const middlewaredRoute = withMiddleware(router, middleware);

const withErrorHandlerRoute = withErrorHandler(middlewaredRoute, errorHandler);

// when accessed will return json { error: true, message: 'wow error' }
withErrorHandlerRoute.get("/errorrouter", (req: Request, res: Response) => {
  throw new Error("Error here");
});
```

#### [](#partialwithmiddleware)partialWithMiddleware

ada juga varian partial dari fungsi withMiddleware, jadi kita bisa membangun helper / utils umum di atasnya, misalnya  

```javascript
// in generateAuthMiddleware.js
const generateAuthMiddleware = partialWithMiddleware(authMiddleware);

// in your routes.js
const router = new Router();
const protectedRoute = generateAuthMiddleware(router);
```

ini bahkan mendukung pemberian middleware ke partialWithmiddleware agar mudah disusun  

```javascript
// in generateAuthMiddleware.js
const generateAuthMiddleware = partialWithMiddleware(authMiddleware);

// in uploadProtectedMiddleware.js
const generateUploadProtectedMiddleware = generateAuthMiddleware(
  uploadMiddleware
);

// in your routes.js
const router = new Router();
const uploadProtectedRouter = generateUploadProtectedMiddleware(router);
```

Kita bisa membaca lebih lanjut tentang fungsi lain yang disediakan library ini di readme repository-nya. Dalam artikel ini, saya akan lebih fokus pada cara membangun aplikasi menggunakan express-Kun. Saya akan menggunakan typescript dalam artikel ini, tetapi akan melewatkan beberapa hal terkait typing, jadi silakan mengikuti dengan javascript jika mau.

Dalam seri artikel ini, kita akan membangun backend untuk aplikasi forum, tempat user bisa login, mem-posting artikel, lalu mengomentari artikel tersebut.

## [](#setup)Setup

mari kita mulai.  
pertama, kita install express dan express-kun  

```bash
yarn add express express-kun
```

lalu mari tambahkan nodemon agar proses development lebih mudah  

```bash
yarn add --dev nodemon typescript
```

di bawah ini adalah setup yang biasa saya gunakan ketika memakai nodemon untuk development typescript  

```json
{
  "watch": ["dist"],
  "ext": "js",
  "exec": "node index.js"
}
```

nanti kita akan melihat cara kerjanya. Mari setup script di package.json kita  

```json
{
  "scripts": {
    "dev": "nodemon",
    "build:watch": "tsc --watch",
    "build": "tsc",
  },
}

```

lalu mari setup aplikasi sederhana kita di `/src/index.ts` (atau .js)  

```javascript
import express from "express";

const app = express();

const PORT = 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`successfully run app in port ${PORT}`);
});
```

sekarang buka 2 terminal. Di terminal pertama, jalankan  

```bash
yarn build:watch
```

dan di terminal kedua, jalankan  

```bash
yarn dev
```

ini akan mempercepat iterasi build dibandingkan menggunakan nodemon + ts-node.

kita seharusnya melihat  

```javascript
successfully run app in port 8000
```

di terminal kedua, lalu pastikan aplikasi kita sudah berfungsi untuk saat ini

## [](#folder-structure)Struktur Folder

struktur folder yang akan kita buat kurang lebih seperti ini  

```javascript
dist/
src/
- index.ts
- modules
- - user
- - - user.model.ts
- - - user.routes.ts
- - - user.controller.ts
- utils
index.js
packae.json
```

## [](#creating-user-endpoint)Membuat User Endpoint

di bagian ini kita akan membuat route berikut  

```text
GET /users -> get all users (public)
GET /users/:id -> get user detail (protected)
POST /users -> Create user / register (public)
POST /users/auth -> Login User (public)
```

pertama-tama, mari buat folder module users seperti di atas. Lalu buat model di `src/modules/user/user.model.ts`

### [](#creating-user-model)Membuat User model

Kita akan menggunakan mongoose dan bcrypt (untuk mengenkripsi password), jadi mari install keduanya  

```bash
yarn add mongoose bcrypt
```

lalu mari definisikan model kita  

```css
// user.model.ts

import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';

function hashPassword(value: any) {
  return bcrypt.hash(value, 'randomSalt');
}

const UserSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    select: false,
    set: hashPassword
  },
  name: {
    required: true,
    type: String
  }
});

const User = model('User', UserSchema);

export default User;
```

setelah itu, mari buat koneksi mongoose kita di helper initDb dalam `src/utils/initDB.ts`  

```css
import mongoose from 'mongoose';

const uri = 'mongodb://localhost:27017/forum';

const initDB = () => {
  return mongoose.connect(
    uri,
    {
      useNewUrlParser: true,
      useFindAndModify: false
    },
    err => {
      if (err) {
        console.log(err.message);
        throw new Error('Error Connecting to Database');
      }
    }
  );
};

export default initDB;

```

sekarang koneksi dan setup db sudah siap. Di artikel berikutnya, kita akan mencoba membuat controller.
