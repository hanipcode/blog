---
title: New blog and why I moved to a static site
description: >-
  A new home—previously, my website was hosted on a DigitalOcean VPS stack with
  Ghost as the blogging platform. This time I'm using a somewhat different stack
  because I chose the static site rou...
publishedAt: '2021-01-15T10:21:04.000Z'
locale: en
translationKey: first-post
tags:
  - Meta
  - Static Sites
draft: false
originalLocale: id
sourceHash: 8506618817680a4e
---
## A new home

previously, my website was hosted on a DigitalOcean VPS stack with Ghost as the blogging platform.
This time I'm using a somewhat different stack because I chose the static site route.

## Why move?

there are a few reasons. the trying-to-sound-cool reason is > _learning a new stack_. but actually...

```javascript
tekor bos bayar digital ocean tiap bulan 5$
```

especially during a pandemic like this, that money is honestly better spent on food. so what stack
would let me maintain a personal blog and still afford to eat? let's talk about the stack

## Blog Stack

### Frontend(?): Hugo

This blog uses Hugo, a static page generator. yeah, it's similar to Gatsby or Jekyll too, if I'm not mistaken. but IMHO, it's much simpler. well, one thing I like about Hugo compared to using Ghost before is that you write in Markdown, and there's no hassle of logging in or anything—just write locally in Markdown, push, and you're done.
On top of that, it already has tons of themes by default, and installing one is as simple as cloning it haha. overall, setting up this blog probably took just 2–3 hours, including the domain stuff.

### Hosting(?): Netlify + Github

Yep. I just put this blog on Github—might as well make it open source, since that cuts costs and means no monthly server bills. if you don't believe me, you can check out my blog here: https://github.com/hanipcode/blog . and for Continuous Deployment, I use Netlify... the free tier, of course.

## Talking Pros and Cons

Okay, let's talk about the advantages and disadvantages now.
The most immediate advantage I've felt is that it makes building a website cheaper. you only need to buy the domain, and if you're willing to use a Netlify or Github subdomain, it could even be free.

Another pro is that it's written in Markdown. so it's easy if I ever want to move it to Dev.to, for example, or switch to another static generator. most other static generators support Markdown too, after all.

Another pro, perhaps specific to Hugo itself, is that it's great for programmers because it comes with syntax highlighting. setting that up in Ghost used to be quite a hassle. example

```javascript
function testJSFunction() {
  return true;
}
```

Hugo really gets programmers—it supports syntax highlighting right out of the box

As for the cons, they're probably more about scaling—it isn't ideal for overly complex websites.
and it also seems like I'll eventually run into scaling issues with Netlify. the free version only gives you 300GB/month of bandwidth. for a blog, that's no problem, I think.

but for a more complex website, you'd need to think it over. and the annoying thing is that providers like Netlify and Firebase offer generous free tiers, but once you exceed their fair usage limits, things can suddenly get expensive.

Are you interested in trying a static site? would you be interested if I made a tutorial on implementing a stack like this?
