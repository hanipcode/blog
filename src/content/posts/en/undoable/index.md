---
title: Creating an Undoable Data Structure in JavaScript
description: >-
  In the previous article, while discussing Functors in FP, we tried creating
  our own data structure in JavaScript, namely the ScoreList data structure. Now
  in this article, let's...
publishedAt: '2020-10-15T10:08:49.000Z'
locale: en
translationKey: undoable
tags:
  - JavaScript
  - Functional Programming
  - Data Structures
draft: false
originalLocale: id
sourceHash: 1762979bb90b9f77
---
In the previous article, while discussing Functors in FP, we tried creating our own data structure in JavaScript, namely the `ScoreList`. 

Now in this article, let's try creating a more useful data structure. Say we want to create a data structure that can be undone and redone—it would look roughly like this:

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

and let's test it: 

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

this data structure will also work with more complex data types, whether arrays or objects.

you might be wondering, doesn't that mean we'll end up doing OOP (Object Oriented Programming) anyway? You could say Undoable is a Class, while update, redo, and undo are properties, right? Not really. Besides, methods and prototypes are actually slightly different, but maybe that's a topic for another time—I'm still too lazy to explain it.
Also, FP doesn't mean our program can't have any classes at all. Even in FP, to work around missing language features and make our lives easier, we'll usually create our own data structures and then compose them. That's why, when using the FP paradigm, you'll rarely find `inheritance`. in fact, even in OOP, one of the clean code mantras is

> composition over inheritance

Anyway, let's save that topic for another article. I'm too lazy.

but there's still a problem with the data structure we created. In our data structure, we can still mess around with the properties of its `instance`, for example

```javascript
const item = new Undoable(5);
console.log(item.value)
// 5;
item.update(6);
item.value = 7;
console.log(item.value)
// 7
```

we can even rewrite the past and the future:

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

truly a data structure beyond comprehension.

if the data can still be changed around, then we can't trust this data structure 100%. because things that keep changing are very hard to trust ~ oof.

Now let's create a version of this Undoable data structure that can't be changed from the outside

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

here we change the `value` property into a getter that isn't `writeable`. and we also make the past and future values of this data structure local variables, rather than `property`. let's try it out

```javascript
const item = new Undoable(5);
console.log(item.value)
// 5;
item.update(6);
item.value = 7;
console.log(item.value)
// 6
```

to be honest, I cheated a little above. We originally used prototypes, but now the `update`, `undo`, and `redo` functions have become properties or methods, making this look even more like OOP. Is there a difference? Yes. Basically, when using methods like the ones above, these functions will be created for every object in the `instantiate`. so every object will have its own update function. prototypes, on the other hand, use delegation, so there's still only one function. Stay tuned for the next article if you want the detailed explanation.

so, is there a way to keep using prototypes while keeping things Immutable? Yes. We can wrap it in an IIFE and create a scope for the variables. That way, variables like _data and so on can be accessed from the prototype without leaking out. But instead of going through the hassle of using an old-school jQuery-era approach, if we're already using a module system and aren't coding directly in the browser, we might as well split it into a separate file. The implementation would look roughly like this

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

this way, the prototype can access the local (file) variables. I'm only creating the interface here because I'm too lazy to write the complete implementation. The mechanism is more or less the same as before anyway.

still curious about the difference between prototypes and object properties? see you in the next article.
