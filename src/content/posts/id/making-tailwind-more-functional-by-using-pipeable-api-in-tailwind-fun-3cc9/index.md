---
title: >-
  Membuat Tailwind lebih fun(ctional) dengan menggunakan pipeable API di
  tailwind-fun
description: >-
  Kalau kamu belum membaca tentang tailwind-fun, kamu bisa membacanya di sini 
  Singkatnya, tailwind fun adalah library yang...
publishedAt: '2023-06-17T04:37:13Z'
locale: id
translationKey: making-tailwind-more-functional-by-using-pipeable-api-in-tailwind-fun-3cc9
tags:
  - TypeScript
  - Tailwind CSS
  - Functional Programming
draft: false
canonicalUrl: >-
  https://dev.to/hanipcode/making-tailwind-more-functional-by-using-pipeable-api-in-tailwind-fun-3cc9
originalLocale: en
sourceHash: a202e23935d86cfe
---
Kalau kamu belum membaca tentang tailwind-fun [kamu bisa membacanya di sini](https://dev.to/hanipcode/simplify-your-tailwind-css-workflow-with-tailwind-fun-3dhp)

Singkatnya, tailwind fun adalah library yang memungkinkan kamu menulis dan menyusun classname tailwind secara deklaratif/ekspresif.

awalnya, alasan saya membuat tailwind-fun adalah karena saya suka FP dan ingin bisa menulis tailwind dengan lebih deklaratif. artinya, saya tidak ingin membuat abstraksi class berbasis component, kecuali kalau memang sengaja sedang membangun design system tentunya.

dan saya berpikir, saat bekerja dengan library FP seperti [fp-ts](https://github.com/gcanti/fp-ts) atau [ts-belt](https://mobily.github.io/ts-belt/) atau lainnya, saya akan punya function [pipe](https://mobily.github.io/ts-belt/api/pipe-flow). lalu saya berpikir, kenapa tidak sekalian membuat pipeable API karena menurut saya ini lebih rapi daripada chainable API.

jadi sekarang, tailwind-fun mengekspos method TWSClass sebagai pipeable API.

sebagai contoh, berikut tampilan contoh dari artikel sebelumnya jika ditulis menggunakan pipeable API

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

## Menyusun menjadi abstraksi berbasis component 

Walaupun sebelumnya saya tidak merekomendasikannya, kalau kamu ingin menyusun class name menjadi abstraksi berbasis component, sekarang hasilnya juga lebih rapi. sebagai contoh, berikut cara menyusun class untuk button

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

### Memperluas alias Semuanya cuma function

karena semua function yang diekspos oleh pipeable API hanyalah function biasa, kamu sebenarnya bisa memperluasnya. begini juga cara saya menyusun API ini secara internal.
sebagai contoh, addWHen menggunakan `add` sebagai dasarnya, dan `addHoverWhen` menggunakan `addWhen` sebagai dasarnya.
kamu pasti sudah menangkap maksudnya. [kamu bisa melihatnya di sini ](https://github.com/hanipcode/tailwind-fun/blob/master/src/pipeable.ts)

Terima kasih sudah membaca artikel ini sampai selesai :D
