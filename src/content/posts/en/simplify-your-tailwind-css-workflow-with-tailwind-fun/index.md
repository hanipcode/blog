---
title: Simplify Your Tailwind CSS Workflow with tailwind-fun
description: >-
  If you're a frontend developer working with Tailwind CSS, you know how
  powerful and versatile it is....
publishedAt: '2023-06-05T04:58:02Z'
locale: en
translationKey: simplify-your-tailwind-css-workflow-with-tailwind-fun
tags:
  - TypeScript
  - Tailwind CSS
  - Frontend
draft: false
canonicalUrl: >-
  https://dev.to/hanipcode/simplify-your-tailwind-css-workflow-with-tailwind-fun-3dhp
---
If you're a frontend developer working with Tailwind CSS, you know how powerful and versatile it is. However, managing class names in your codebase can quickly become overwhelming, especially when dealing with conditional rendering or dynamically changing styles. That's where the tailwind-fun library comes to the rescue. In this blog post, we'll explore how tailwind-fun can simplify your Tailwind CSS workflow and make your code more readable and maintainable.

## [](#what-is-tailwindfun)What is tailwind-fun?

tailwind-fun is a lightweight JavaScript library designed to streamline the management of Tailwind CSS class names. It provides a fluent API that allows you to easily add, remove, and modify class names based on various conditions and variants. Whether you're handling conditional rendering, hover effects, or applying different styles based on user interactions, tailwind-fun has got you covered.

## [](#simplified-and-declarative-class-name-handling)Simplified and Declarative Class Name Handling

One of the standout features of TWSClass is its declarative approach to class name handling. Let's take a look at an example:  

```jsx
import { TWS } from 'twsclass';

const Component = ({ isHighlighted, isDisabled) => <div className= {TWS('btn')
  .add('text-red-500')
  .addWhen(isHighlighted, 'bg-yellow-200')
  .removeWhen(isDisabled, 'cursor-not-allowed')}> text</div>
```

or some more complex example  

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

## [](#handling-hover-effects-and-variants)Handling Hover Effects and Variants

tailwind-fun also provides built-in support for handling hover effects and other Tailwind CSS variants. Let's consider an example where we want to apply a hover effect to a button:  

```css
const twsClass = TWS('btn')
  .addHover('bg-blue-500')
  .addVariants('hover:text-white', 'text-blue-500');

const classNames = twsClass.className;
```

In this case, we use the addHover method to add a hover class name, which applies the bg-blue-500 style when hovering over the button. Additionally, we use the addVariants method to apply the hover:text-white variant, which changes the text color to white on hover.

With tailwind-fun, handling hover effects and other variants becomes straightforward and intuitive. You can easily manage complex class name combinations without sacrificing readability or maintainability.

## [](#composing-style-using-tailwindfun)Composing style using tailwind-fun

you can also compose style for your components like this using tailwind-fun  

```jsx
const button = TWS("flex p-5");
const buttonPrimary = button.addClass("bg-pimrary");
const buttonSecondary = button.addClass("bg-secondary");

// and use in element
<button className={button.className} />
<button className={buttonPrimary.className} />
<button className={buttonSecondary.className} />

```

but I wouldn't recommend it, because I think the point of using tailwind is to not having to abstract class into component based style. it even better to write tailwind classes into the html directly and to use tailwind-fun sparingly and only if you needed to add logic to your classes. tailwind-fun purpose is more like of [https://www.npmjs.com/package/classnames](https://www.npmjs.com/package/classnames) rather than any other css library

think of tailwind-fun as a classnames but on steroid, since it more expressive and declarative.

## [](#update-tailwindfun-020)Update (Tailwind-fun 0.2.0)

in the version 0.2.0 tailwind fun adding a pipeable api, you can [read about it here](https://dev.to/hanipcode/making-tailwind-more-functional-by-using-pipeable-api-in-tailwind-fun-3cc9). it make you able to write using tailwind-fun like below  

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

## [](#conclusion)Conclusion

The tailwind-fun library provides a powerful yet lightweight solution for managing Tailwind CSS class names in a simplified and declarative manner. By using the fluent API and built-in methods, you can handle conditional rendering, hover effects, and other class name modifications with ease. Say goodbye to convoluted class name manipulation and embrace a cleaner, more maintainable codebase.

To start using tailwind-fun in your projects, simply install the library via npm or include it directly in your codebase. Visit the official documentation [https://github.com/hanipcode/tailwind-fun](https://github.com/hanipcode/tailwind-fun) for detailed usage instructions and explore the full range of capabilities.

Upgrade your Tailwind CSS workflow with tailwind-fun
