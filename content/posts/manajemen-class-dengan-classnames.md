---
title: "Manajemen Css Dengan CSS Module dan Library Classnames"
date: 2020-06-05T17:00:27+07:00
draft: false
toc: false
images:
cover: "img/3.jpg"
tags:
  - untagged
---

## Apa itu CSS Module

sebelum meembahas library classnames  ada baiknya kamu mengetahui dulu tentang css modules. secara gampang nya css modules adalah melakukan import styles menjadi seperti mengimport modules, contoh seperti dibawah
```javascript
import styles from './styles.css'
```

pertama-tama  mari kita perjelas dulu beberapa hal. pertama, bagaimana css modules bekerja ? css modules bekerja dengan menambahkan hash pada setiap style yang di import. jika  isi file  css kamu seperti demikian misal
```css
.expanded {
  height: 100px;
}
```
maka pada saat **compile time** mejadi file hasil generate css dari bundler semacam webpack, webpack akan menambahkan hash pada keelas css tersebut. misal menjadi `.expanded_131321`. maka dari itu, saat kamu mengimport styles tersebut sebagai modules, kamu tidak bisa lagi meenggunakan class tersebut dengan cara begini
```javascript
import styles from 'styles.scss';
function  App() {
  return (
    <div className="expanded">
    </div>
  )
}
```
cara demikian tidak akan bekerja, mengapa ? karena pada saat **compile time** nama kelas tersebeut sudah diberi hash dan dirubah oleh webpack. lalu  dimana hasil compile time terseebt disimpan ? hasl tersebut disimpan di style yang kita import sebagai module atau dalam kasus diatas di object `styles`. jadi kita dapat menggunakan class tersebut deengan cara seperti dibawah
```javascript
import styles from 'styles.scss';

function App() {
  return  (
    <div className={styles.expanded}>
    </div>
  )
}
```
semua ini baik baik saja, ketika setiap komponen kita hanya  memiliki satu className, masih  simpel. semua mulai kompleks ketika negara api menyerang dan component kita memiliki banyak nama kelas yang itupun perlu di update secara kondisional

## Bisa kah css module di combine dengan css framework ?
Mungkin kamu bertanya  tanya tentang hal ini. bisa gak sih  css module ini digabng  dengan css framework biasa. tentu bisa. bundler (webpack) hanya melakukan hashing pada file style yang kita import, tidak ke semua style. maka contohlah kamu menggunakan suatu framework grid, kamu dapat melakukan demikian
```javascript
import styles from 'styles.scss';

function App() {
  return  (
    <div className={`col-4 ${styles.expanded}`}>
    </div>
  )
}
```
syntax diatas akan bekereja sesuai semestinya, karena global style tidak akan diubah ubah oleh bundler. tapi, mulai terlihat kurang enak dilihat ya ? disini lah berguna nya library `classnames` yang akan kita bahas

## Apa itu classnames
Library classnames adalah library yang mempermudah kita untuk melakukan perubahan style secara conditional. misalkan cara yang lazim kita lakukan demikian:
```javascript
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
bukankah itu terlihat sangat kompleks hanya untuk memanage perubahan style yang bergantung pada state ? itu baru bergantung pada satu state, belum jika state  nya lebih banyak lagi.

## Penggunaan classnames library
Classnames library memungkinkan kita untuk melakukan demikian
```javascript
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
Terlihat lebih rapih bukan ? apalagi ketika perubahan styles tersebut bergantung pada banyak kondisi

## Lebih jauh dengan classnames.bind

Nah classnames ini punya fitur tambahan lagi yang mampu membuat code kita lebih rapih. yaitu `.bind`. kegunaan.bind ini adalah untuk melakukan pengikatan antara module classnames ini dengan css yang kita import. sehingga dari awalnya kamu melakukan
```javascript
    <div className={cx({
      globalclassname: true,
      [`${styles.container}`]: true,
      [`${styles.expanded}`]: expanded
    })}>
      <p>somee expanded componnet</p>
    </div>
```
jamu dapat melakukan
```javascript
    <div className={cx({
      globalclassname: true,
      container: true,
      expanded: expanded
    })}>
      <p>somee expanded componnet</p>
    </div>
```
seperti dilihat diatas, kita tidak perlu lagi mengakses module styles yang kita import itu  sendiri, seolah kita menggunakan global style. cara melakukan pengikatan tersebut adalah seperti dibawah

```javascript
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

nah jadi pada dasarnya, classnames.bind ini adalah membuat instance baru dari function classnames yang kemudian kita assign ke variable `cx`. instance baru tersebut sudah otomatis paham bahwa dia perlu mengubah nama nama kelas dengan berdasar ke object `styles` terlebih dahulu sebeelum mengecek nama kelas di global style. 
dengan demikian, jadi lebih rapih kan code kita ?

Sekian dulu dari saya, kita jumpa lagi di artikel seleanjutnya.