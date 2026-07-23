---
title: Memory in Javascript
description: 'three funny words, honestly.'
publishedAt: '2025-10-14T16:23:29.939Z'
locale: en
translationKey: memory-di-javascript
tags:
  - JavaScript
  - Performance
draft: false
canonicalUrl: 'https://hanipcode.substack.com/p/memory-di-javascript'
originalLocale: id
sourceHash: 1f2001da2b069224
---
just an opinion.

but I think people should learn coding starting from backend, or even system programming if possible (which is why I kind of agree with colleges starting with languages like c++/c).

because there are so many essential things that are “mandatory” in backend but are sometimes allowed to be skipped in frontend.

take memory, for example. in backend, the “cost” of memory falls on the programmer, like server costs. but in frontend, the “cost” falls on the user. so it often gets brushed off with “computers are so powerful these days anyway”.

and it’s not like it doesn’t exist or can’t be learned, either. browsers have a stack and a heap too. and if we oversimplify, we can think of every object in js as having a pointer to memory in the heap assigned to its variable. so. if inside a loop we do

```javascript
const newObj = {...oldObj, newKey: “something” } 
```

that’s basically the same as creating a new object in the heap for each of the N loop iterations, and btw arrays also count as “objects” in javascript.

so sometimes, though not always, if you feel like your app is eating a lot of memory and needs optimization. find the biggest loop that creates the most objects. do 2 things

1.  if it uses .map .filter .reduce and the other dot-whatevers, change it to a \`boomer loop\` first, aka a simple \`for\` loop.
    
2.  instead of creating a new object, if you can mutate it, mutation might be better.
    
3.  instead of copying an object, sometimes it’s enough to take only the data we need and create a new object from just that. for example
    

```javascript
const Rect = {x,y,width,height, boundingBox}

// terus kita mau lakuin sesuatu dengan x y, bikin aja object Point
const Point = { x: Rect.x, y: Rect.y }
// baru lakuin kalkulasi
calculateSomething(Point)
```

besides storing simple primitives like booleans or numbers, the stack in javascript is mostly used to store execution contexts

what’s an execution context? it’s how javascript knows, for example, when it executes this on a certain line

```javascript
const a = x+ y;
```

how does it know where x and y come from? so every time we create a function in javascript, we create what’s called an execution context, which contains things like parameters, local variables inside that function, references to the outer scope, and so on, including the “this” object. everything is set up first, then executed line by line. that’s why when js runs the line containing x+y above, it already knows what x and y refer to.

so what about the global scope? same thing. when the browser first loads the page, it creates a global execution context whose contents are more or less the same as the function execution context from earlier. that’s why if you try this at the top level / in the global scope

```javascript
console.log(this)
```

there’s something in it, right? it contains the window object. so, to keep it simple, you can imagine that the JavaScript Engine itself is also a function doing the same thing. yeah, just think of javascript as a function inside a function.

so earlier we talked about how javascript starts with an execution context, and when it creates that execution context it also stores the references it needs, like the function’s arguments, variables, etc.

so when it runs a line of javascript, it already knows where each variable should refer to, because at the start of every execution context javascript first declares all the variables inside that execution context.

but then how can we get an error like this?

![](https://substackcdn.com/image/fetch/$s_!c77-!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa2d289fb-6e08-436b-9ebe-6cc1b8be6fee_786x75.png)

first, because declaration and definition/initialization are two different things.

a declaration is just like telling the computer, “Bambang will come into this room later.” so all the computer knows is “there’s going to be someone named Bambang.” if we tell the computer to ask Bambang to make noodles before Bambang arrives, the computer gets confused: “wait, which Bambang?”

Definition is when we tell Bambang to come in and introduce him to the computer: here, this is Bambang. then the computer can tell Bambang to make noodles.

back to the error in the screenshot. that’s why the error can be read as “trying to access a variable that has been declared but not yet defined/initialized.” if we think about it further, if the browser knew absolutely nothing about c when it reached the line c= c\*5, then c should be undefined, right? not an error like the one above..

so all variables and functions in javascript are declared at the top, and this is what we call hoisted.

except that functions aren’t just declared at the top, they’re also defined there. that’s why this doesn’t throw an error

![](https://substackcdn.com/image/fetch/$s_!4zwr!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8083a089-e7f5-409e-82b5-f38b7de4e640_436x66.png)

functions in javascript can be used anywhere, even when their position in the code is below the call. but this only applies to regular functions like

```javascript
function gas(w) { console.log(w)  }
```

not this one

```javascript
const gas = function(w) { console.log(w)}
```

don’t believe me? here

![](https://substackcdn.com/image/fetch/$s_!8Dcd!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa06f92bc-fe86-4427-bc2b-8a1fe496eeed_729x88.png)

simply put, functions are treated specially in javascript. in my opinion, it’s because of historical reasons and backward compatibility.

so back in the day, people put the <script> tag below the body, right. because browsers parse html from top to bottom, and the DOM could only be accessed after the <body> had been parsed. and say they wrote

```jsx
<button onclick="someFunction">
```

so this button is in the body, with the script below it. if this were also fixed when JS introduced lexical scope (topic for another day), a lot of old-school websites would break.

so how can scripts from modern frameworks like react now be placed above the body and still work? because now we can add \`defer\` to the script tag or set its type to \`module\`, which means the script will be loaded after the DOM has finished loading. bundlers usually add this, especially when exporting as client only / SPA. so something like

```javascript
<script type="module" src="./bundle.js></script>
```

so what happens after this execution context stack, or stack frame, gets put on the stack?

maybe let’s talk about the stack first. think of the stack as a row of memory, or if you want to oversimplify it, just think of it as an array.

the difference is that while heap memory is stored in RAM, the stack is stored in the CPU, so the stack has less memory than the heap, but it’s faster to access.

we also mentioned earlier that primitives are stored on the stack, while objects are stored in the heap, and then their pointers are stored on the stack. so say there’s code like this

```javascript
let x = 5;
let y = 6;
const point = { x, y}
```

what javascript does is

store x = 5 in stack memory

store y = 6 in stack memory

because point is non-primitive and an object, create the { x, y} object in the heap

store point = (the pointer / address of that {x,y} in the heap) in stack memory

in another language that supports pointers, this would be basically the same as

p = Point{ x, y}

point = \*p

now let’s talk about the code below

```javascript
let x= 5;
let y= 6;
let point = {x, y}
x = 6;
```

once the stack reaches and executes x = 6, what do you think the value of \`point\` is?

its value will contain { x: 5, y: 6 }, as shown below

![](https://substackcdn.com/image/fetch/$s_!ANcb!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe433b93f-e76f-4dfe-81a8-a414bd451e42_316x177.png)

why? because it goes back to the rule: a primitive is stored directly as its value on the stack. so when it’s used / passed into an object, naturally its value is what gets passed too. or, in other words, copy by value.

what about this

```javascript
let point1 = {x: 5, y: 6}
let point2 = point1
let rect = {point: point1, width: 50, height: 60};
point1 = {x: 6, y: 7}
console.log(point1)
console.log(point2)
console.log(rect)
```

what’s the output?

![](https://substackcdn.com/image/fetch/$s_!EUZZ!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F79dc64ff-fc97-4d85-8b25-da0f2d3d1abd_396x221.png)

the key is that this address can also be thought of as a “primitive,” and it behaves like other primitives, meaning it’s copied by value

in short, point1 becomes {6,7}, but why are rect.point and point2 still {5,6}? let’s cosplay as the stack and break down the process

line 1

create the {x: 5, y: 6} object in the heap, then store point1 = address on the stack

line 2

remember that on the stack we already have point1 = the address of the object created in the heap

so point2=point1 is the same as taking the value of point1, which is the address of that object,

then copying its value into point2 (because primitives are copied by value)

line 3

same as before, first take the value of point1 from the stack, which is the address of the {x: 5, y:6} object in the heap.

create a new object in the heap containing

{point: \*address of the original {x:5,y:6} object in the heap\*, width: 50, height: 60}

set rect = the address of the object we just created above on the stack.

line 4

create a new {x: 6, y: 7} object in the heap

reassign point1 = the address of the {x:6,y:7} object above

so what gets replaced on line 4 isn’t the object itself, because that’s in the heap, but the value of point1. it changes from a pointer to {x: 5, y:6} in the heap to a pointer to {x: 6, y:7} in the heap.

now remember, an address is treated like a primitive value, so on lines 2 and 3, it gets copied and its value gets assigned to point2 and also to rect.point.

if it helps, we can think of the stack as only being able to store primitives, with addresses counting as primitives like numbers, booleans, etc. and on the stack, because its memory is small, changing a variable means deleting its old value.

Now because it gets deleted immediately, to keep code like this

```javascript
let a = 5;
let b = a;
```

from breaking. when b = a is executed, the value 5 gets copied and put into b. in other words, the 5 inside a and the 5 inside b have different addresses. so if a gets reassigned and the value 5 inside a is deleted, that’s no problem.

now connect that concept with how every non-primitive in javascript, like the point object above, is stored in the Heap, and when it’s put into a variable, what gets stored in that variable is a pointer or address to that object in the heap. that’s why when we do

```javascript
let point2 = point1
```

because this address is a primitive, the address inside point1 gets copied and assigned to point2. that’s why when

```javascript
let point1 = { x: 6, y: 7}
```

point1’s value gets replaced with the address of the new {x: 6, y:7} object in the heap. but point2 isn’t affected, because what was previously assigned to point2 was the address of {x:5 y: 6} in the heap, and it was assigned by copying that address value. remember, only the address value, not the object itself.

now, a value on the stack gets deleted every time its variable is reassigned, like

```javascript
let x =5;
x=6
```

but it’s a different story if

```javascript
let point1 = {x: 5 , y:6}
let point2 = point1
point1.x = 6
console.log(point1)
console.log(point2)
```

![](https://substackcdn.com/image/fetch/$s_!aNjq!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7be474dc-33ec-4dc6-a941-383907f44872_286x132.png)

how come point2 changes too? let’s go line by line again

line 1

create {x:5, y:6} in the heap. assign its address value to point1

line 2

take the address value from point1, copy it, and assign it to point2 (here, point1 and point2 will refer to the same value/memory in the heap)

line 3

we can think of point1.x as accessing the {x:5, y:6} object in the heap using the address in point1.

change the x value of that object to 6

so again, whenever we pass an object in js, what gets passed is its address in the heap. and because point1 and point2 refer to an object at the same memory address, it looks like point2’s value changed. but what actually changed was the x value of the {x, y} object in the heap.

okay, we’ve covered how whenever a value is no longer used, like when a variable on the stack gets reassigned, that value gets deleted. what about the heap? when an address is reassigned, we can’t just delete it, right, like in the previous example,

```javascript
let point1 = {x: 5, y: 6}
let point2 = point1
let rect = {point: point1, width: 50, height: 60};
point1 = {x: 6, y: 7} << line 4
console.log(point1)
console.log(point2)
console.log(rect)
```

when point1 gets assigned a new memory address on line 4 (the {x: 6,y:7} object), we can’t delete the {x:5, y:6} object. because then if point2 or rect.point were accessed, their memory in the heap would already be gone. in C, this is called a dangling pointer. in other words, a pointer whose address is still stored even though its memory has already been freed/deleted

so what if an object in the heap really isn’t being used anymore? like for example

```javascript
let point1= {x: 5, y:6}
let point2 = point1
point1 = {x: 6, y:7}
point2 = {x: 7, y:8} <<< line 4
```

on line 4, the address of the {x:5, y:6} object in the heap no longer exists anywhere on the stack, right? (because every reassignment deletes the old value on the stack). but if the object in the heap isn’t deleted either, then that becomes a memory leak, right? basically the opposite of the dangling pointer from earlier. here, the address is no longer used anywhere on the stack, but the memory still exists.

this is where the Garbage Collector comes in. the garbage collector’s job is to find memory whose address is no longer being used and delete it from the heap. the browser runs the Garbage Collector automatically in cycles, without us having to run it ourselves.

so what happens if we create and delete a large amount of memory very quickly. like the example we discussed above about creating a new object inside a loop? naturally, we make the Garbage Collector’s job heavier. this is called GC Pressure, and it affects the CPU too.

so there you go. I didn’t expect a random discussion about memory in javascript to turn into this much yapping. we’re actually not done yet. we haven’t talked about what happens when running a function, for example.

but yeah, I’m not sure anyone’s interested either, so let’s leave it here for now. maybe leave a comment if you want me to continue this discussion!
