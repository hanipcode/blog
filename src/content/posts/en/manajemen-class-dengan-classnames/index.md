---
title: Managing CSS with CSS Modules and the Classnames Library
description: >-
  What Are CSS Modules? Before discussing the classnames library, it's a good
  idea to learn about CSS modules first. Put simply, CSS modules let you import
  styles like you would import modules, for examp...
publishedAt: '2020-06-05T10:00:27.000Z'
locale: en
translationKey: manajemen-class-dengan-classnames
tags:
  - React
  - CSS
  - Frontend
draft: false
originalLocale: id
sourceHash: 211a9451e48b906e
---
## What Are CSS Modules?

Before discussing the classnames library, it's a good idea to learn about CSS modules first. Put simply, CSS modules let you import styles like you would import modules, as in the example below
```jsx
import styles from './styles.css'
```

First, let's clear a few things up. First, how do CSS modules work? CSS modules work by adding a hash to every imported style. For example, let's say your CSS file looks like this
```css
.expanded {
  height: 100px;
}
```
then during **compile time** when the bundler, such as webpack, generates the resulting CSS file, webpack will add a hash to that CSS class. For example, it might become `.expanded_131321`. Because of that, when you import those styles as modules, you can no longer use the class like this
```jsx
import styles from 'styles.scss';
function  App() {
  return (
    <div className="expanded">
    </div>
  )
}
```
this approach won't work. Why? Because during **compile time** the class name has already been hashed and changed by webpack. So where is the compile-time result stored? It's stored in the styles we imported as a module, or in the case above, in the object `styles`. So we can use the class like this
```jsx
import styles from 'styles.scss';

function App() {
  return  (
    <div className={styles.expanded}>
    </div>
  )
}
```
This is all fine when each of our components only has one className—it's still simple. Things start getting complicated when the Fire Nation attacks and our component has lots of class names that also need to be updated conditionally

## Can CSS modules be combined with a CSS framework?
You might be wondering about this. Can CSS modules be combined with a regular CSS framework? Of course they can. The bundler (webpack) only hashes the style files we import, not every style. So, for example, if you're using a grid framework, you can do this
```jsx
import styles from 'styles.scss';

function App() {
  return  (
    <div className={`col-4 ${styles.expanded}`}>
    </div>
  )
}
```
the syntax above will work as expected because global styles won't be modified by the bundler. But it's starting to look a little messy, right? This is where the `classnames` library we're about to discuss comes in handy

## What Is classnames?
The classnames library makes it easier to change styles conditionally. For example, we would commonly do something like this:
```jsx
// another import 
// ..
import styles from './styles.css'

function App() {
  const [expanded, setIsExpanded] = useState(false);
  // another part of component
  return (
    <div className={`globalclassname ${styles.container} ${expanded ? : styles.expanded: ''}`}>
      <p>somee expanded componnet</p>
    </div>
  )
}
```
Doesn't that look very complicated just to manage style changes that depend on state? And that's only with one state, never mind if there are even more states.

## Using the classnames Library
The classnames library lets us do this
```jsx
import styles from 'styles.css';
import cx from 'classnames';

function App() {
  const [expanded, setIsExpanded] = useState(false);
  // another part of component
  return (
    <div className={cx({
      globalclassname: true,
      [`${styles.container}`]: true,
      [`${styles.expanded}`]: expanded
    })}>
      <p>somee expanded componnet</p>
    </div>
  )
}
```
Looks neater, doesn't it? Especially when those style changes depend on multiple conditions

## Going Further with classnames.bind

Now, classnames has another feature that can make our code even neater, namely `.bind`. The purpose of .bind is to bind the classnames module to the CSS we import. So instead of doing this
```jsx
    <div className={cx({
      globalclassname: true,
      [`${styles.container}`]: true,
      [`${styles.expanded}`]: expanded
    })}>
      <p>somee expanded componnet</p>
    </div>
```
you can do this
```jsx
    <div className={cx({
      globalclassname: true,
      container: true,
      expanded: expanded
    })}>
      <p>somee expanded componnet</p>
    </div>
```
As you can see above, we no longer need to access the imported styles module itself, as if we were using global styles. Here's how to set up that binding

```jsx
import styles from 'styles.scss';
import classnames from 'classnames';

const cx = classnames.bind(styles);

function App() {
  const [expanded, setIsExpanded] = useState(false);
  // another part of component
  return (
    <div className={cx({
      globalclassname: true,
      container: true,
      expanded: expanded
    })}>
      <p>somee expanded componnet</p>
    </div>
  )
}
```

So basically, classnames.bind creates a new instance of the classnames function, which we then assign to the variable `cx`. That new instance automatically knows that it needs to transform class names based on the object `styles` first before checking the class names in the global styles. 
That makes our code neater, right?

That's all from me for now. See you again in the next article.
