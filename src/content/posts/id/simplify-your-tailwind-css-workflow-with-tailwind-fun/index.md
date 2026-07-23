---
title: Sederhanakan Workflow Tailwind CSS Kamu dengan tailwind-fun
description: >-
  Kalau kamu seorang frontend developer yang bekerja dengan Tailwind CSS, kamu
  pasti tahu betapa powerful dan fleksibelnya tool ini....
publishedAt: '2023-06-05T04:58:02Z'
locale: id
translationKey: simplify-your-tailwind-css-workflow-with-tailwind-fun
tags:
  - TypeScript
  - Tailwind CSS
  - Frontend
draft: false
canonicalUrl: >-
  https://dev.to/hanipcode/simplify-your-tailwind-css-workflow-with-tailwind-fun-3dhp
originalLocale: en
sourceHash: ea18eddffbd801d2
---
Kalau kamu seorang frontend developer yang bekerja dengan Tailwind CSS, kamu pasti tahu betapa powerful dan fleksibelnya tool ini. Namun, mengelola nama class di codebase bisa cepat terasa merepotkan, terutama saat menangani conditional rendering atau style yang berubah secara dinamis. Di sinilah library tailwind-fun hadir sebagai solusi. Dalam postingan blog ini, kita akan membahas bagaimana tailwind-fun dapat menyederhanakan workflow Tailwind CSS dan membuat code kamu lebih mudah dibaca dan dipelihara.

## [](#what-is-tailwindfun)Apa itu tailwind-fun?

tailwind-fun adalah library JavaScript ringan yang dirancang untuk mempermudah pengelolaan nama class Tailwind CSS. Library ini menyediakan fluent API yang memungkinkan kamu menambah, menghapus, dan mengubah nama class dengan mudah berdasarkan berbagai kondisi dan variant. Baik saat menangani conditional rendering, efek hover, maupun menerapkan style yang berbeda berdasarkan interaksi pengguna, tailwind-fun siap membantu.

## [](#simplified-and-declarative-class-name-handling)Penanganan Nama Class yang Sederhana dan Deklaratif

Salah satu fitur unggulan TWSClass adalah pendekatan deklaratifnya dalam menangani nama class. Mari kita lihat contohnya:  

```jsx
import { TWS } from 'twsclass';

const Component = ({ isHighlighted, isDisabled) => <div className= {TWS('btn')
  .add('text-red-500')
  .addWhen(isHighlighted, 'bg-yellow-200')
  .removeWhen(isDisabled, 'cursor-not-allowed')}> text</div>
```

atau contoh lain yang lebih kompleks  

```tsx
import { TWS } from "tailwind-fun";

type DateRowProps = { dates: readonly Date[] };

const overlayClass = (
  isSelected: boolean,
  isToday: boolean,
  isSameMonth: boolean
) =>
  TWS("absolute h-[36px] w-[36px] top-[-5.5px] left-[-7.5px] rounded-full")
    .addWhen(isSelected, "bg-selectedBlue")
    .addWhen(isToday, "border-selectedBlue border")
    .addVariants("group-hover", "bg-white z-10");

export const DateRow = consumeDateReducer<DateRowProps>(
  ({ dates, selectedMonth, dispatch, isSelected }) => (
    <div className="flex gap-5 mb-3 ">
      {dates.map((date) => (
        <button
          onClick={() => dispatch({ type: "UpdateDate", date })}
          className={
            TWS("flex-1 grow text-center relative group").addWhen(
              !isSameMonth(selectedMonth, date),
              "opacity-50"
            ).className
          }
        >
          <div
            className={
              overlayClass(
                isSelected(date),
                isToday(date),
                isSameMonth(selectedMonth, date)
              ).className
            }
          ></div>
          <span className={TWS("relative group-hover:text-dark").className}>
            {getDate(date)}
          </span>
        </button>
      ))}
    </div>
  )
);

```

## [](#handling-hover-effects-and-variants)Menangani Efek Hover dan Variant

tailwind-fun juga menyediakan dukungan bawaan untuk menangani efek hover dan variant Tailwind CSS lainnya. Mari kita lihat contoh ketika kita ingin menerapkan efek hover pada sebuah tombol:  

```css
const twsClass = TWS('btn')
  .addHover('bg-blue-500')
  .addVariants('hover:text-white', 'text-blue-500');

const classNames = twsClass.className;
```

Dalam kasus ini, kita menggunakan method addHover untuk menambahkan nama class hover, yang menerapkan style bg-blue-500 saat kursor berada di atas tombol. Selain itu, kita menggunakan method addVariants untuk menerapkan variant hover:text-white, yang mengubah warna teks menjadi putih saat di-hover.

Dengan tailwind-fun, menangani efek hover dan variant lainnya menjadi mudah dan intuitif. Kamu bisa mengelola kombinasi nama class yang kompleks tanpa mengorbankan kemudahan membaca atau memelihara code.

## [](#composing-style-using-tailwindfun)Menyusun style menggunakan tailwind-fun

kamu juga bisa menyusun style untuk component seperti ini menggunakan tailwind-fun  

```jsx
const button = TWS("flex p-5");
const buttonPrimary = button.addClass("bg-pimrary");
const buttonSecondary = button.addClass("bg-secondary");

// and use in element
<button className={button.className} />
<button className={buttonPrimary.className} />
<button className={buttonSecondary.className} />

```

tapi saya tidak merekomendasikannya, karena menurut saya tujuan menggunakan tailwind adalah agar kita tidak perlu mengabstraksikan class menjadi style berbasis component. bahkan lebih baik menulis class tailwind langsung di html dan menggunakan tailwind-fun seperlunya, hanya jika kamu perlu menambahkan logika ke class. tujuan tailwind-fun lebih mirip seperti [https://www.npmjs.com/package/classnames](https://www.npmjs.com/package/classnames) daripada library css lainnya

anggap saja tailwind-fun sebagai classnames yang lebih powerful, karena lebih ekspresif dan deklaratif.

## [](#update-tailwindfun-020)Pembaruan (Tailwind-fun 0.2.0)

di versi 0.2.0, tailwind fun menambahkan pipeable api, kamu bisa [membacanya di sini](https://dev.to/hanipcode/making-tailwind-more-functional-by-using-pipeable-api-in-tailwind-fun-3cc9). fitur ini memungkinkan kamu menggunakan tailwind-fun seperti di bawah ini  

```css
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

## [](#conclusion)Kesimpulan

Library tailwind-fun menyediakan solusi yang powerful namun ringan untuk mengelola nama class Tailwind CSS dengan cara yang sederhana dan deklaratif. Dengan menggunakan fluent API dan method bawaan, kamu bisa menangani conditional rendering, efek hover, dan perubahan nama class lainnya dengan mudah. Ucapkan selamat tinggal pada manipulasi nama class yang berbelit-belit dan beralihlah ke codebase yang lebih rapi dan mudah dipelihara.

Untuk mulai menggunakan tailwind-fun di project kamu, cukup install library ini melalui npm atau sertakan langsung di codebase. Kunjungi dokumentasi resminya [https://github.com/hanipcode/tailwind-fun](https://github.com/hanipcode/tailwind-fun) untuk petunjuk penggunaan yang mendetail dan menjelajahi seluruh kemampuannya.

Tingkatkan workflow Tailwind CSS kamu dengan tailwind-fun
