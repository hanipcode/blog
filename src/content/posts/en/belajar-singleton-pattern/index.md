---
title: Learning the Singleton Design Pattern for Frontend
description: >-
  What Is a Singleton? A Singleton is a class in a program that stores a shared
  resource globally, so that shared resource can...
publishedAt: '2020-06-04T03:13:27.000Z'
locale: en
translationKey: belajar-singleton-pattern
tags:
  - JavaScript
  - Design Patterns
  - Frontend
draft: false
originalLocale: id
sourceHash: 9f164d7676512b75
---
## What Is a Singleton?

A Singleton is a class in a program that stores a _shared resource_ globally, so that _shared resource_ can be used by other classes or functions in the program.

When implementing a singleton, we have to make sure there is only one Singleton instance while the application is running to prevent memory leaks and ensure that any changes happen only in that one instance. This is usually done by making the class constructor private, so other classes or functions in the program cannot create a new instance.

## Advantages of the Singleton pattern

The Singleton pattern is useful when we want to manage a _shared resource_ like in the example later, where we'll try to create a SoundManager class to control sound in the program.

## Disadvantages of the Singleton pattern

The Singleton pattern has several disadvantages. One of them is that it can become an anti-pattern of the _Single Responsibility Principle_ if it isn't used carefully, because it can lead to a class that does too many things.

Besides that, a singleton is also an anti-pattern because the Singleton itself is a global object. Why are global objects an anti-pattern? Because global objects tend to be unpredictable. We can't guarantee that global data won't change.
For example, let's say a singleton has state

```typescript
class Singleton {
  // ....
  private muted = false;

  setMuted(status: boolean) {
    this.muted = status;
  }
  getMuted() {
    return this.muted;
  }
  // ....
}
```

because this muted state can keep changing, we can't be sure what its value will be if many parts of our program call setMuted().

The final disadvantage is that a Singleton tends to be inflexible. Why? Because a singleton's constructor is private, so we can't reuse the Singleton if a special requirement suddenly comes up in just one part of the program (rather than globally).

## A Few Tips for Implementing the Singleton Pattern Safely

First, keep the SRP mantra in mind. Don't make our Singleton do too many things, especially things it shouldn't need to do just because the singleton can be accessed globally.

Second, don't store too much state in the Singleton, because it will be difficult to track.

## Singleton Example

Here we'll learn how to create a Singleton called SoundManager in JavaScript, which will control sound in an application. Just a note: JavaScript doesn't currently support private constructors, but TypeScript does. To see the demo, you can [click here](https://hanifsungkar.com/test-sound/). And for the completed repo, you can [view it here](https://github.com/hanipcode/singleton-sound-manager-example)

First, let's create the Singleton skeleton

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

As you can see above, to get the singleton instance we use SoundManager.getInstance()`, then we export that instance.

After that, we'll add the initialization of the sound objects inside the constructor

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

Here I added the sound data owned by the sound manager inside constructor(). Since we're sure the constructor won't be called again, this isn't a problem.

For the rest, let's add other functionality such as playing sound and muting it, so the SoundManager class code looks like this

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

Now our SoundManager is ready and can be used in a React Component (for example) like this

```jsx
import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import SoundManager from "./SoundManager";

function App() {
  const [muted, setMuted] = useState(SoundManager.muted);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <button onClick={() => SoundManager.play("jump")}>Play jump</button>
        <button onClick={() => SoundManager.play("walk")}>Play walk</button>
        <button onClick={() => SoundManager.startBgMusic()}>
          Play BG music
        </button>
        <button onClick={() => SoundManager.pauseBgMusic()}>
          Pause BG music
        </button>
        <button onClick={() => SoundManager.replayBGMusic()}>
          REplay BG music
        </button>
        <div>Is muted : {muted.toString()}</div>
        <button
          onClick={() => {
            SoundManager.muteOrUnmute();
            setMuted(SoundManager.muted);
          }}
        >
          {muted ? "unmute" : "mute"}{" "}
        </button>
      </header>
    </div>
  );
}

export default App;
```

Pretty easy, right? As discussed at the beginning, this Singleton is suitable for managing a SharedResource that definitely shouldn't have two instances. One example is music. We certainly don't want multiple instances of an audio object. Instead of making that audio object global, it's better to use the Singleton Pattern to wrap it.

[See the demo here](https://hanifsungkar.com/test-sound/)
