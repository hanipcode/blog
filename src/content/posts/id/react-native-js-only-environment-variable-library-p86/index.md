---
title: Library Environment Variable Khusus JS untuk React Native
description: >-
  Library untuk mengelola environment variable khusus JS dengan mudah di React
  Native
publishedAt: '2020-01-02T20:38:06Z'
locale: id
translationKey: react-native-js-only-environment-variable-library-p86
tags:
  - JavaScript
  - React Native
  - Open Source
draft: false
canonicalUrl: 'https://dev.to/hanipcode/react-native-js-only-environment-variable-library-p86'
originalLocale: en
sourceHash: 2106db6d2abee4c6
---
Hai guys, jadi beberapa hari lalu saya membaca postingan di sini tentang Environment Variable di React Native. Penulisnya membuat saya sadar bahwa Envfile seharusnya hanya digunakan saat build/compile time.  
jadi saya baru saja membuat library Environment Variable khusus JS untuk React Native. silakan cek  
[https://github.com/hanipcode/rnenv](https://github.com/hanipcode/rnenv)

### [](#my-goals)Tujuan saya

-   bisa di-install sebagai dev dependency
-   Khusus JS, tidak perlu native modules (kamu bisa menggunakan react-native-config untuk itu)
-   mendukung beberapa environment
-   memilih environment lewat command, contohnya `rnenv ENV=production npm run build:android`

tapi maaf kalau bahasa Inggris saya kurang bagus.
