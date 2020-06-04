---
title: "Belajar Singleton Design Pattern untuk Frontend"
date: 2020-06-04T10:13:27+07:00
draft: false
toc: false
images:
cover: "img/2.jpg"
tags:
  - untagged
---

## Apa itu Singleton
Singleton adalah sebuah kelas didalam program dimana kelas tersebut menyimpan *shared resource* atau resource bersama secara global, sehingga *shared resource* tersebut dapat digunakan oleh kelas atau fungsi lain didalam program tersebut.

Secara implementasi, dalam membuat singleton kita harus memastikan bahwa hanya ada satu instance Singleton pada saat aplikasi berjalan, agar tidak terjadi memory-leak dan memastikan perubahan apapun hanya terjaddi pada satu instance tersebut. Biasanya ini dilakukan dengan membuat konstruktor kelas tersebut private sehingga kelas atau fungsi lain didalam program tersebut tidak dapat membuat instance baru.

## Kelebihan Singleton pattern
Singleton pattern berguna ketika kita ingin mengelola *shared resource* seperti di contoh nanti yang kita lakukan adalah kita mencoba membuat kelas SoundManager untuk mengkontrrol sound didalam program.

##  Kekurangan Singleton pattern
Ada beberapa kekurangan ddari Singleton pattern. yaitu, salah satunya adalah Singleton pattern ini bisa menjadi anti-pattern dari *Single Responsibility Principle* jika tidak digunakan dengan hati hati. karena akan membuat sebuah kelas yang melakukan terlalu banyak hal.

Selain itu, singleton juga anti-pattern dimana Singleton ini sendiri adalah sebuah  global object. kenapa Global object itu anti-pattern ? karena global-object cenderung bersifat unpredictable. kita tidak bisa memastkan sebuah data global tidak berubah.
contoh katakan lah sebuah singleton memiliki state
```typescript
class Singleton {
  // ....
  private muted = false;

  setMuted(status: boolean) {
    this.muted = status;
  } 
  getMuted() {
    return this.muted
  }
  // .... 
}
```
karena state muted ini dapat berubah berubah, kita tidak dapat memastikan state ini bernilai apa jika banyak bagian dari program kita yang melakukan setMuted().

Kekurangan yang terakhir adalah Singleton ini cenderung tidak fleksibel. kenapa ? karena constructor singleton bersifat private, sehingga kita tidak dapat mereuse Singleton ini jika tiba tiba ada kebutuhan khusus hanya di salah satu bagian program (tidak global).

## Beberapa Tips Untuk Implementasi Singleton Pattern yang Aman

pertama, tetap ingat mantra SRP, jangan melakukan terlalu banyak hal di Singleton kita bahkan sampai yang seharusnya tidak  perlu mentang mentang singleton ini dapat diakses secara global.

kedua, jangan simpan terlalu  banyak state di Singleton. karena akan susah di track.


## Contoh Singleton

Disini kita akan belajar membuat Singleton bernama SoundManager pada javascript dimana dia  akan mengkontrol Sound didalm suatu aplikasi. untuk catatan, javascript tidak support terhadap private constructor untuk saat ini, tapi typescript bisa untuk meliihat demo nya, teman teman bisa [klik disini](https://hanipcode.com/test-sound/). dan untuk repo nya yang sudah jadi teman teman dapat [melihat disini](https://github.com/hanipcode/singleton-sound-manager-example)

pertama, mari membuat kerangka Singleton
```javascript
class SoundManager {
  private _instance = null;
  constructor() {}
  
  static getInstance() {
    if (_instance === null) {
      this._instance = new SoundManager();
    }
    return this._instance
  }
}

const SoundManagerInstance = SoundManager.getInstance();
export default SoundManagerInstance;
```

seperti di lihat diatas, untuk mendapat kan instance darri singleton kita menggunakan SoundManager.getInstance()`, kemudian  yang kita export adalah instance nya.

setelah itu, kita akan menambahkan inisialisasi sound sound object nya didalam constructor

```javascript
const SOUND_CONFIG = {
  walk:  'jump.wav',
  jump: 'jump.flac',
  bg: 'abeth.wav',
};

class SoundManager {
  sounds = {};

  private _instance = null;
  constructor() {
    this.sounds['walk']  = new Audio(SOUND_CONFIG['walk']);
    this.sounds['jump'] = new Audio(SOUND_CONFIG['jump']);
    this.sounds['bgMusic'] = new Audio(SOUND_CONFIG['bg']);
  }
  
  static getInstance() {
    if (_instance === null) {
      this._instance = new SoundManager();
    }
    return this._instance
  }
}
// ...
```

disini saya menambahkan data sound yang dimiliki sound manager di dalam constructor(). karena kita yakin bahwa constructor tidak akan dipanggil lagi, ini menjadi hal yang tidak masalah.

sisanya, mari kita tambahkan fungsionalitas lain seperti untuk memutar sound, melakukan mute, sehingga code kelas SoundManager nya menjadi seperti dibawah

```javascript
class SoundManager {
  sounds = {};
  bgMusicPlayed = false;
  muted = false;
  private _instance = null;
  
  constructor() {
    this.sounds['walk']  = new Audio(SOUND_CONFIG['walk']);
    this.sounds['jump'] = new Audio(SOUND_CONFIG['jump']);
    this.sounds['bgMusic'] = new Audio(SOUND_CONFIG['bg']);
  }

  static getInstance() {
    if (_instance === null) {
      this._instance = new SoundManager();
    }
    return this._instance
  }

  play(soundName) {
    this.sounds[soundName].play();
  }

  startBgMusic() {
    if (!this.bgMusicPlayed) {
      this.sounds['bgMusic'].play();
      this.bgMusicPlayed = true;
    }
  }

  pauseBgMusic() {
    if (this.bgMusicPlayed) {
      this.sounds['bgMusic'].pause();
      this.bgMusicPlayed = false;
    }
  }

  replayBGMusic() {
    this.sounds['bgMusic'].currentTime = 0;
    this.startBgMusic();
  }

  muteOrUnmute() {
    const soundsKey = Object.keys(this.sounds);
    soundsKey.forEach((key => {
       this.sounds[key].muted  = !this.muted;
    }));
    this.muted = !this.muted;
  }
}

```

Nah, SoundManager kita telah ready dan dapat digunakan di React Component (misalnya) seperti dibawah

```jsx
import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import SoundManager from './SoundManager';

function App() {
  const [muted, setMuted]  = useState(SoundManager.muted);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <button onClick={() => SoundManager.play('jump')}>Play jump</button>
        <button onClick={() => SoundManager.play('walk')}>Play walk</button>
        <button onClick={() => SoundManager.startBgMusic()}>Play BG music</button>
        <button onClick={() => SoundManager.pauseBgMusic()}>Pause BG music</button>
        <button onClick={() => SoundManager.replayBGMusic()}>REplay BG music</button>
        <div>Is muted : {muted.toString()}</div>
        <button onClick={() => {
          SoundManager.muteOrUnmute();
          setMuted(SoundManager.muted);
        }}>{muted ?  'unmute': 'mute'} </button>
      </header>
    </div>
  );
}

export default App;
```

Nah mudah kan. seperti yang dibahas di awal, Singleton ini cocok untuk memanage SharedResource yang pasti tidak ada dua. contohnya adalah music. kita tentu tidak ingin ada multiple instance untuk sebuah audio. daripada kita membuat global object audio tersebut, ada baiknya kita menggunakan Sinigleton Pattern untuk membungkusnya.

[Demo lihat disini](https://hanipcode.com/test-sound/)