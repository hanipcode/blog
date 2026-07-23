---
title: React Native JS Only Environment Variable Library
description: Library for simple manage js only environment variable in react nativ
publishedAt: '2020-01-02T20:38:06Z'
locale: en
translationKey: react-native-js-only-environment-variable-library-p86
tags:
  - JavaScript
  - React Native
  - Open Source
draft: false
canonicalUrl: 'https://dev.to/hanipcode/react-native-js-only-environment-variable-library-p86'
---
Hi guys, So a few days ago I read post here about Environment Variable in React Native, the Author made me realize that an Envfile should be build/compile time only.  
so I just created a library for React Native JS-only Environment variable. checkit out  
[https://github.com/hanipcode/rnenv](https://github.com/hanipcode/rnenv)

### [](#my-goals)My goals

-   can be installed as dev dependency
-   JS only, no need native modules (you can use react-native-config for that)
-   suport multiple environment
-   select environment as command for example `rnenv ENV=production npm run build:android`

sorry for my bad english though.
