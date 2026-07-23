---
title: >-
  Membuat Middleware Autentikasi JWT Express Sederhana dengan Express-Kun (Tidak
  perlu setup Passport!)
description: Membuat Middleware Autentikasi JWT Express Sederhana dalam 5 Menit
publishedAt: '2020-02-21T22:19:42Z'
locale: id
translationKey: >-
  creating-a-simple-express-jwt-authentication-middleware-in-5-minutes-with-express-kun-4aa3
tags:
  - JavaScript
  - Express
  - Authentication
draft: false
canonicalUrl: >-
  https://dev.to/hanipcode/creating-a-simple-express-jwt-authentication-middleware-in-5-minutes-with-express-kun-4aa3
originalLocale: en
sourceHash: 929e845580e64413
---
Autentikasi adalah middleware yang sangat umum di backend. Di artikel ini saya akan menunjukkan cara membuat autentikasi sederhana tanpa perlu setup Passport.

pertama, mari kita init aplikasi Express  

```bash
yarn add express
```

lalu buat index.js sederhana  

```javascript
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded());

app.listen(8000, () => {
  console.log('server run successfully')
})
```

oke, lalu mari kita setup model Mongoose kita di models/user.js  

```bash
yarn add mongoose bcrypt
```

```javascript
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

function setPassword(value) {
  return bcrypt.hashSync(value, 10);
}

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    set: setPassword
  }
});

const model = mongoose.model("User", UserSchema);

module.exports = model;

```

lalu mari kita buat controller untuk membuat user dan login user di controllers/users.js (sekalian kita buat token JWT)  

```bash
yarn add jsonwebtoken
```

```javascript
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

async function create(req, res) {
  const { email, password } = req.body;

  const user = await User.create({
    email,
    password
  });

  res.json({
    user,
    message: "create user successfully"
  });
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({
    email
  });

  if (!user) {
    throw Error("User not found");
  }
  if (bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ user }, "yourSecretKey", {
      expiresIn: "24h"
    });

    res.json({
      user,
      token,
      message: "create user successfully"
    });
  } else {
    res.status(401).json({
      message: "Unauthenticated"
    });
  }
}

module.exports = {
  create,
  login,
}
```

mari kita tambahkan controller tersebut ke route:  

```text
POST /users
POST /users/login
```

index.js kita menjadi seperti ini  

```javascript
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const userController = require("./controllers/user");

mongoose.connect("mongodb://localhost/exampledb").then(() => {
  console.log("success connect db");
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/users", userController.create);
app.post("/users/login", userController.login);

app.listen(8000, () => {
  console.log("server run successfully");
});

```

sekarang mari kita buat router  

```text
GET /users
GET /users/:id 
```

tapi dilindungi dengan autentikasi JWT. Bagaimana caranya? Pertama, mari kita install express-kun  

```bash
yarn add express-kun
```

lalu pertama-tama mari kita pisahkan dan export user ke router tersendiri di routes/user.js  

```css
const { Router } = require('express');
const userController = require('../controllers/user');
const router = Router();

router.post('/', userController.create);
router.post('/login', userController.login);

module.exports = router;

```

lalu gunakan di aplikasi kita di `index.js`  

```javascript
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const userRouter = require("./routes/user");

mongoose.connect("mongodb://localhost/exampledb").then(() => {
  console.log("success connect db");
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/users", userRouter);

app.listen(8000, () => {
  console.log("server run successfully");
});

```

oke, sekarang mari kita build router yang dilindungi. Cara paling sederhana adalah menggunakan `withJWTAuthMiddleware` dari express-kun. (di balik layar, ini hanya memanfaatkan `withMiddleware` tapi menggunakan middleware siap pakai untuk autentikasi JWT)  
mari kita gunakan itu dengan secretKey kita  

```css
const { Router } = require("express");
const userController = require("../controllers/user");
const { withJWTAuthMiddleware } = require("express-kun");
const router = Router();

const protectedRouter = withJWTAuthMiddleware(router, "yourSecretKey");

router.post("/", userController.create);
protectedRouter.get("/", userController.getAll);
router.post("/login", userController.login);
protectedRouter.get("/:id", userController.get);

module.exports = router;

```

lalu mari kita buat controllers/user.js yang sesuai  

```javascript
async function getAll(req, res) {
  const user = await User.find({});
  res.json({
    user,
    message: "create user successfully"
  });
}

async function get(req, res) {
  const user = await User.findOne({
    _id: req.params.id
  });
  res.json({
    user,
    message: "create user successfully"
  });
}

module.exports = {
  create,
  login,
  get,
  getAll,
};
```

mari kita coba akses route `GET /users` untuk mendapatkan semua user, kita akan mendapat error 401 ini:  

```json
{
"message": "Invalid Token",
"error": "No Authorization Header"
}
```

agar bisa mengaksesnya, kita memerlukan bearer token di Authorization dengan format berikut  

```text
Authorization: `Bearer $token`
```

mari kita login, ambil token-nya, lalu coba di Postman. Request-nya akan berhasil

[![Alt Text](https://res.cloudinary.com/practicaldev/image/fetch/s--nCT2XYZa--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://dev-to-uploads.s3.amazonaws.com/i/esk6k7lrp1cyns1ie5ec.png)](https://res.cloudinary.com/practicaldev/image/fetch/s--nCT2XYZa--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://dev-to-uploads.s3.amazonaws.com/i/esk6k7lrp1cyns1ie5ec.png)

Selesai. Kita berhasil membuat route terautentikasi pertama kita.

### [](#going-further)Lebih lanjut

mari kita bahas lebih dalam. Cara di atas bekerja dengan sederhana. Tapi bagaimana membuatnya lebih efisien? Kalau kita tahu sebuah routes berisi semua route yang dilindungi, kita bisa membuat dan meng-export protectedRoutes alih-alih routes utama, contohnya  

```css
// /Gallery Resource
const router = Router();

const protectedRouter = withJWTAuthMiddleware(router, "yourSecretKey");
prtectedRouter.post("/", userController.create);
protectedRouter.get("/", userController.getAll);
protectedRouter.get("/:id", userController.get);

module.exports = protectedRouter;
```

namun proses ini akan berulang kalau kita punya routes lain yang semuanya dilindungi. Untuk menyederhanakannya, kita bisa membuat helper di helpers/createProtectedRouter  

```javascript
module.exports = function() {
  const router = Router();
  return withJWTAuthMiddleware(router, 'yourSecretKey');
};
```

jadi sekarang di bagian lain aplikasi kita bisa melakukan ini  

```css
// Resource /Friends
const protectedRouter = createProtectedRouter();
prtectedRouter.post("/", userController.create);
protectedRouter.get("/", userController.getAll);
protectedRouter.get("/:id", userController.get);

module.exports = protectedRouter;
```

inilah filosofi utama express-kun. Kita bisa build 'router dengan middleware' yang reusable dan meneruskannya ke mana saja, bahkan antar-project. Ingat bahwa `withJWTAuthMiddleware` menggunakan `withMiddleware` di balik layar.

### [](#customization)Kustomisasi

Jadi kita ingin menyesuaikan autentikasinya, misalnya tidak ingin menggunakan bearer? Tentu saja bisa. Sebenarnya, berikut source code dari withJWTAuthMiddleware  

```typescript

export default function withJWTAuthMiddleware(
  router: Router,
  secretKey: string,
  getToken: GetTokenFun = getTokenFromBearer,
  preCheckFun?: PreCheckFun,
  errorHandler?: ErrorRequestHandler,
  verifyOptions?: jwt.VerifyOptions
) {
  return withMiddleware(
    router,
    jwtAuthMiddleware(
      secretKey,
      getToken,
      preCheckFun,
      errorHandler,
      verifyOptions
    )
  );
}

```

dan berikut source code untuk jwtAuthMiddleware siap pakai  

```typescript
export default function jwtAuthMiddleware(
  secretKey: string,
  getToken: GetTokenFun,
  preCheckFun?: PreCheckFun,
  errorHandler?: ErrorRequestHandler,
  verifyOptions?: jwt.VerifyOptions
) {
  return async function middleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const token = await getToken(req);
      if (preCheckFun) {
        preCheckFun(req, res);
      }
      await jwt.verify(token, secretKey, verifyOptions);
      res.locals.token = token;
      res.locals.decoded = jwt.decode(token);
      next();
    } catch (e) {
      if (errorHandler) {
        errorHandler(e, req, res, next);
        return;
      }
      if (e instanceof jwt.JsonWebTokenError || e instanceof TokenError) {
        res.status(401).json({
          message: "Invalid Token",
          error: e.message
        });
        return;
      }
      res.status(500).json({
        message: "Internal server Error",
        error: e.message,
        stack: e.stack
      });
    }
  };
}

```

hal pertama yang perlu diperhatikan, middleware ini akan meneruskan JSON yang sudah di-decode ke `res.locals.decoded` yang bisa kita akses di controller.  
selain itu, middleware ini juga menerima dan menjalankan function getToken.  
function getToken adalah function yang menerima object request dan harus mengembalikan token.  
sebagai contoh, berikut source code default getTokenFromBearer  

```typescript
export default function getTokenFromBearer(req: Request) {
  const authorization = req.headers.authorization;
  if (!authorization) {
    throw new TokenError("No Authorization Header");
  }
  try {
    const token = authorization?.split("Bearer ")[1];
    return token;
  } catch {
    throw new TokenError("Invalid Token Format");
  }
}
```

jadi kalau token berada di queryString ?token, kita bisa membuat sesuatu seperti ini  

```typescript
export default function getTokenFromQuery(req: Request) {
  const {token} = req.query;
  if (!token) {
    throw new TokenError("No Token Query");
  }
  return token;
}
```

kita juga bisa memiliki function preCheck yang akan menerima object request dan response, lalu bisa melakukan apa pun di sana. Misalnya, kalau kita ingin memeriksa apakah user ada, dan kita juga bisa menyediakan custom error handler sendiri!

Sekian untuk postingan ini. Terima kasih, kalau tertarik dengan library ini, silakan dicoba!
