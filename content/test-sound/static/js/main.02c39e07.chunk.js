(this["webpackJsonptest-sound"]=this["webpackJsonptest-sound"]||[]).push([[0],[,,,function(e,t,n){e.exports=n.p+"static/media/logo.5d5d9eef.svg"},,,function(e,t,n){e.exports=n(13)},,,,,function(e,t,n){},function(e,t,n){},function(e,t,n){"use strict";n.r(t);var a=n(0),s=n.n(a),u=n(2),i=n.n(u),o=(n(11),n(3)),c=n.n(o),l=(n(12),n(4)),r=n(5),d=new(function(){function e(){Object(l.a)(this,e),this.sounds={},this.bgMusicPlayed=!1,this.sounds.walk=new Audio("jump.wav"),this.sounds.jump=new Audio("jump.flac"),this.sounds.bgMusic=new Audio("abeth.wav")}return Object(r.a)(e,[{key:"play",value:function(e){this.sounds[e].play()}},{key:"startBgMusic",value:function(){this.bgMusicPlayed||(this.sounds.bgMusic.play(),this.bgMusicPlayed=!0)}},{key:"pauseBgMusic",value:function(){this.bgMusicPlayed&&(this.sounds.bgMusic.pause(),this.bgMusicPlayed=!1)}},{key:"replayBGMusic",value:function(){this.sounds.bgMusic.currentTime=0,this.startBgMusic()}}]),e}());var m=function(){return s.a.createElement("div",{className:"App"},s.a.createElement("header",{className:"App-header"},s.a.createElement("img",{src:c.a,className:"App-logo",alt:"logo"}),s.a.createElement("p",null,"Edit ",s.a.createElement("code",null,"src/App.js")," and save to reload."),s.a.createElement("button",{onClick:function(){return d.play("jump")}},"Play jump"),s.a.createElement("button",{onClick:function(){return d.play("walk")}},"Play walk"),s.a.createElement("button",{onClick:function(){return d.startBgMusic()}},"Play BG music"),s.a.createElement("button",{onClick:function(){return d.pauseBgMusic()}},"Pause BG music"),s.a.createElement("button",{onClick:function(){return d.replayBGMusic()}},"REplay BG music")))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));i.a.render(s.a.createElement(s.a.StrictMode,null,s.a.createElement(m,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}],[[6,1,2]]]);
//# sourceMappingURL=main.02c39e07.chunk.js.map