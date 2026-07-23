---
title: >-
  Things I learned While Developing Express-Kun (Backend Helpers for express app
  development)
description: >-
  I learned a things or two While Developing Express-Kun (Backend Helpers for
  express app development). this will be a series about it
publishedAt: '2020-02-21T20:49:52Z'
locale: en
translationKey: >-
  things-i-learned-while-developing-express-kun-backend-helpers-for-express-app-development-j44
tags:
  - JavaScript
  - Express
  - Backend
draft: false
canonicalUrl: >-
  https://dev.to/hanipcode/things-i-learned-while-developing-express-kun-backend-helpers-for-express-app-development-j44
---
## [](#intro)Intro

Hi guys, So a while back I developed a library that aim to simplify backend development. I don't want to build a framework, I just want to build something like lodash but for backend-specific development. So I built express-kun. a library that providing a set of helper that use functional programming mindset. the concept is simple, for example if you want to create reusable middleware you just pass a router then it will returned back a `midlewared router`. you can checkout the documentation for more example here [https://github.com/hanipcode/express-kun](https://github.com/hanipcode/express-kun)

## [](#about-this-series)About this series

So I thought it will really simple to implement this library. But I never felt so wrong, might be because my lack of knowledge about javascript especially about it prototypal nature I thought I want to documented the process so I write this series. here we go to the first bump

### [](#things-i-just-know-about-express-gt-routerget-is-not-calling-a-get-in-the-router-class-directly-but-it-use-a-route-object-rotuer-different-than-route)Things I just know about express -> router.get is not calling a get in the router class directly but it use a route object (Rotuer different than Route).

Really, this hit me hard. Till know even though I spent hours reading express Router's source code I don't understand how it really implemented. My understanding of it barely scratch the surface.

I thought this library would be very simple. I thought I should just implement it by replacing the `router.get` to another function like this (I will simplify it but you can read the source code in the repo I linked above)  

```javascript
withMiddleware(router, middleware) {
 router.get = function(path, ...handlers) {
   router.get(path, middleware, handlers)
 }
 // other method more or less the same..
 return router;
}
```

but I get this error  

```text
 var __spreadArrays = (this && this.__spreadArrays) || function () {
                                                               ^

RangeError: Maximum call stack size exceeded
```

I was stupid actually, If I think about it the previous code will do an infinite recursion. so after hit by this error I check at express source code for Router ([https://github.com/expressjs/express/blob/master/lib/router/index.js](https://github.com/expressjs/express/blob/master/lib/router/index.js)). checkout line 507 - 513.  

```javascript
methods.concat('all').forEach(function(method){
  proto[method] = function(path){
    var route = this.route(path)
    route[method].apply(route, slice.call(arguments, 1));
    return this;
  };
});
```

methods is an npm package that list available Http method. and then it just loops over the methdo name. and  

```javascript
  proto[method] = function(path){
    var route = this.route(path)
    route[method].apply(route, slice.call(arguments, 1));
    return this;
  };
```

this is the interesting path. so for an router object it create handler for every http method. but that handler is actually applying a method on a route object (remember that Router and Route is different). each router have a route object. (you can see a route source code here [https://github.com/expressjs/express/blob/master/lib/router/route.js](https://github.com/expressjs/express/blob/master/lib/router/route.js)).  
Here is when I feel more stupid. after knowing that I don't go to the obvious answer but instead make my second mistake:

### [](#things-i-just-know-about-express-gt-router-does-not-return-a-plain-object-but-instead-a-callable-function-but-with-property)Things I just know about express -> Router() does not return a plain object but instead a callable function but with property.

to test this you can write something like you will see that router can be called as a function that shorthand for router.use  

```javascript
const router = new Router();
router(yourMiddleware);
```

I know this because my second attempt was I try to replace the get method from .get etc like below  

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

actually this work for a while, really. but the problem is when you want to split multiple endpoint to multiple router for example if you have `routes.js` like below  

```javascript
import userRouter from './modules/user/user.routes';
import postRouter from './modules/post/post.routes';

const apiRouter = Router();

apiRouter.use('/users', userRouter);
apiRouter.use('/posts', postRouter);
```

then in your post.routes  

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

it hit me with an error:  

```text
TypeError: Router.use() requires a middleware function but got a Object
    at Function.use (/Users/hanif/Projects/express-kun-example/node_modules/express/lib/router/index.js:458:13)
```

yup. it error at `apiRouter.use('/posts', postRouter)`. because postRouter is something that returned from withMiddleware and it's not really a router function. it was an object created by spread operator. that was the problem. actually there are workaround to create the post.routes like below  

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

you still exporting the main router. but every router will still be registered because withMiddleware actually just registering a middleware inside that router. but that's very counterintuitive and I don't want my library to be confusing.

finally I came to the obvious solution:  

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

the code above was current code in the repo. here you notice that I was using a normal function instead of arrow function. so I can still get the 'this' value of the router. then I put the method inside the route object. actually this was just modifying this code from the express codebase  

```javascript
  proto[method] = function(path){
    var route = this.route(path)
    route[method].apply(route, slice.call(arguments, 1));
    return this;
  };
```

## [](#outro)Outro

alright that was my stupid bump on developing my `express-kun` library. if you can learn a thing or two, that's great. and if you like the concept of the library, do try it. Thanks!
