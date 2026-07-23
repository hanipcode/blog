---
title: >-
  Building an Express Application with Express-Kun, a functional-paradigm
  express helper - Part 1 (Intro and Setup)
description: >-
  In this article, I will try to explain how to simply build an app using a
  helper that I built
publishedAt: '2020-02-14T18:45:23Z'
locale: en
translationKey: >-
  building-an-express-application-with-express-kun-a-functional-paradigm-express-helper-part-1-intro-and-setup-26gp
tags:
  - TypeScript
  - Express
  - Backend
draft: false
canonicalUrl: >-
  https://dev.to/hanipcode/building-an-express-application-with-express-kun-a-functional-paradigm-express-helper-part-1-intro-and-setup-26gp
---
## [](#introduction)Introduction

Today I was just building a library for express js. the library was functional-first express helpers for the common use cases. I built this library gaining inspiration from frontend libraries like Lodash or redux.

I think the beauty of both library is that those libraries only extends the functionality and not really getting in the way we write our app. for example when using redux, redux doesn't redefine how we write our react component. it only cares that we pass our component to the connect function. meanwhile Lodash, it let us do common things easily.

I think I haven't found such a framework/library for express that doesn't get in the way or change how I write my application. so I build express-Kun ([https://github.com/hanipcode/express-kun](https://github.com/hanipcode/express-kun)).

The library is simple enough. it does one of 2 things:

1.  You pass a router, it returned back the modified router
2.  You pass a router and middleware/error handler, it returned callback with the modified router as a param.

there are some function that we will gonna use from express-kun in this series

#### [](#withmiddleware)withMiddleware

you pass a router and middleware, it will return the 'midlewared' router  

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

because this is only return the midlewared router. you can chain it without modifying the first router behavior  

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

you pass a router and error handler, it will return the router, and if any of the handler return error in runtime it will passed to the error handler  

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

this provide further more functionality to compose middleware with error handler  

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

there is also a partial variant for withMiddleware function so you can build a general helper / utils on top of it for example  

```javascript
// in generateAuthMiddleware.js
const generateAuthMiddleware = partialWithMiddleware(authMiddleware);

// in your routes.js
const router = new Router();
const protectedRoute = generateAuthMiddleware(router);
```

this even support supplying partialWithmiddleware with middleware for easy composition  

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

You can read more about other function provided by the library in the readme of the repository. in this article, I will focus more on how to build an App using express-Kun. I will be using typescript in this article but I'll omit some typing stuff so you can feel free if you want to follow along using javascript.

In this article series we will build a backend for forum application. where user can login, post article and then comment the article.

## [](#setup)Setup

let's start.  
first, we install express and express-kun  

```bash
yarn add express express-kun
```

then let's add nodemon for easier development  

```bash
yarn add --dev nodemon typescript
```

below is my usual setup when using nodemon for typescript development  

```json
{
  "watch": ["dist"],
  "ext": "js",
  "exec": "node index.js"
}
```

you will see how this work later. let's setup script in our package.json  

```json
{
  "scripts": {
    "dev": "nodemon",
    "build:watch": "tsc --watch",
    "build": "tsc",
  },
}

```

then let's setup our simple app in `/src/index.ts` (or .js)  

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

now open up 2 terminal. in the first terminal run  

```bash
yarn build:watch
```

and in the second terminal run  

```bash
yarn dev
```

this will iterate the build faster than using nodemon + ts-node.

you should see  

```javascript
successfully run app in port 8000
```

in the second terminal and verify that our app working as for now

## [](#folder-structure)Folder Structure

the folder strructure we gonna build are more or less like this  

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

## [](#creating-user-endpoint)Creating User Endpoint

in this section we will create these routes  

```text
GET /users -> get all users (public)
GET /users/:id -> get user detail (protected)
POST /users -> Create user / register (public)
POST /users/auth -> Login User (public)
```

first thing first let's create the users module folder like in the above. then build the model in `src/modules/user/user.model.ts`

### [](#creating-user-model)Creating User model

We will be using mongoose and bcrypt (for password encryption) for this, so let's install these  

```bash
yarn add mongoose bcrypt
```

then let's define our model  

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

and then let's build our mongoose connection in the helper initDb in `src/utils/initDB.ts`  

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

now the db connection and setup is ready. in the next article we will try to build the controller.
