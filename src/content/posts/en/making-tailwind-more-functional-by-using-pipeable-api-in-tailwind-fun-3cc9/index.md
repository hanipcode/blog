---
title: Making Tailwind more fun(ctional) by using pipeable api in tailwind-fun
description: >-
  If you haven't read about tailwind-fun you can read it here  In short,
  tailwind fun is a library that...
publishedAt: '2023-06-17T04:37:13Z'
locale: en
translationKey: making-tailwind-more-functional-by-using-pipeable-api-in-tailwind-fun-3cc9
tags:
  - TypeScript
  - Tailwind CSS
  - Functional Programming
draft: false
canonicalUrl: >-
  https://dev.to/hanipcode/making-tailwind-more-functional-by-using-pipeable-api-in-tailwind-fun-3cc9
---
If you haven't read about tailwind-fun [you can read it here](https://dev.to/hanipcode/simplify-your-tailwind-css-workflow-with-tailwind-fun-3dhp)

In short, tailwind fun is a library that give you the ability to writting and composing tailwind classname declaratively/expressively.

now, the initial reason why I built tailwind-fun was because am into FP and I like to be able to write tailwind more declaratively. which mean I don't want to create a components based class abstraction unless if I am intentionally building a design system of course.

and am thinking, when working with FP lib like [fp-ts](https://github.com/gcanti/fp-ts) or [ts-belt](https://mobily.github.io/ts-belt/) or etc. I will have a [pipe](https://mobily.github.io/ts-belt/api/pipe-flow) function. then am thinking to why not just create pipeable api since I think it is more cleaner than chainable api.

so now, tailwind-fun expose TWSClass methods as an pipeable api.

for example here how the example in previous article if translated using pipeable api

```typescript
import { TWS, addVariants, addWhen, removeWhen  } from 'tailwind-fun';

const pipe = <T>(value: T, ...fns: Function[]) =>
  fns.reduce((prev, next) => next(prev), value);

const overlayClass = (
  isSelected: boolean,
  isToday: boolean,
  isSameMonth: boolean
) =>
  pipe(
    TWS('absolute h-[36px] w-[36px] top-[-5.5px] left-[-7.5px] rounded-full'),
    addWhen(isSelected, 'bg-selectedBLue'),
    addWhen(isToday, 'border-selectedBlue border'),
    removeWhen(isSameMonth, 'border-selectedBlue'),
    addVariants('group-hover', 'bg-white z-10')
  );

const Overlay = () => <div className={overlayClass(isSelected,isToday,isSameMonth).className}></div>
```

## Composing into component based abstraction 

Even though am not recommending it before, but if you want to compose class name to component based abstraction, it is become more cleaner now too. for example here how you compose a button class

```typescript
import { TWS, addVariants, addWhen, removeWhen  } from 'tailwind-fun';

const pipe = <T>(value: T, ...fns: Function[]) =>
  fns.reduce((prev, next) => next(prev), value);

const buttonClass = ({ primary, secondary, fluid, widthPx }: any) =>
  pipe(
    TWS('block p-5'),
    addWhen(primary, 'bg-primary text-primary'),
    addWhen(secondary, 'bg-secondary'),
    addWhen(fluid, 'w-100'),
    addWhen(Number.isInteger(widthPx), `w-[${widthPx}px]`)
  );

console.log(buttonClass({ primary: true, fluid: true }).className); //block p-5 bg-primary text-primary w-100
console.log(buttonClass({ secondary: true, fluid: true }).className); // block p-5 bg-secondary w-100;
console.log(buttonClass({ primary: true, widthPx: 50 }).className); // block p-5 bg-primary text-primary w-[50px];
```

### Extending a.k.a Its all just function

since all the pipeable api exposed function is just a function you can actually extend it. its also how I compose the api internally.
for example, addWHen is using `add` at its base, and `addHoverWhen` is using `addWhen` at its base.
you get the idea. [you can see it here ](https://github.com/hanipcode/tailwind-fun/blob/master/src/pipeable.ts)

Thank you for reading through the article :D
