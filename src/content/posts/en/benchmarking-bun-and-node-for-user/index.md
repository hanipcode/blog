---
title: Benchmarking Bun and Node.js for a User Creation and Login API
description: A practical comparison of Bun and Node.js, including a surprising result around password hashing and concurrency.
publishedAt: '2025-10-12T16:42:39.561Z'
locale: en
translationKey: benchmarking-bun-and-node-for-user
tags:
  - Bun
  - Node.js
  - Backend
  - Performance
draft: false
canonicalUrl: 'https://hanipcode.substack.com/p/benchmarking-bun-and-node-for-user'
---
So I am currently doing challenge to improve node/express backend to see how far I can improve it and I will benchmark it to see what result I can achieve.

github url: https://github.com/hanipcode/bun-node-rest-benchmark (in case you just coming back to get it)

# Goals

so I myself usually do not really trust a micro benchmark. especially if it compare between two completely different language. So what I am thinking the goal for this benchmark is to take a backend application and see how far I can make it fast.

My personal goal is actually to decide myself whether I would continue using typescript with Node/Bun runtime or whether I don’t like what I see and I’ll choose other technology.

Also in this run I might not want to test the obvious. like adding Redis in front or optimizing the postgres side. why? because it is just an obvious optimization that we can do in any language. I want to see how far node/bun environment can be fast without optimizing outside of application layer/runtime

## The backend we test

The backend we test is a simple backend app with authentication routes. with these stack:

\- Application: Node.js 20 + Express + TypeScript

\- Database: PostgreSQL 16 (Alpine)

\- ORM: TypeORM

\- Password Hashing: Argon2 (CPU-intensive, libuv threadpool)

\- Authentication: JWT (jsonwebtoken)

\- Monitoring: prom-client (Prometheus metrics exporter)

1why chose to test this way ? because doing crypto like hashing password is memory intensive. and I want to see whether we can make it fast in Node/Bun or not. we will also test non memory intensive routes. and I also want to test the overhead of ORM vs using query builder. especially related to the GC pressure

here are the endpoints

1\. Health Check (GET /health) - Simple endpoint to verify server responsiveness

2\. User Registration (POST /api/users) - CPU-intensive operation using Argon2 password hashing

3\. User Authentication (POST /api/users/login) - Password verification with Argon2

4\. Protected Routes (GET /api/users) - JWT-authenticated endpoint requiring database queries

You can think it as something like this:

1 is the bare or base, it literally just sending JSON. I add this because I also want to test to change the runtime from Node to Bun. so I need this,

2 is the most memory intensive because it do password hashing + storing to Postgres.

3 login is somewhat the same, only the operation is only read to the database not writing it.

4 should be above 1 but below 2 and 3. because it has database read and jwt verify but no password hashing

## How we test

to make it somewhat representative of using actual server I test using a docker container instead of my computer.

at first I tried with 0.5 CPU and 256 MB and get 90% of the request (without any optimization yet) to be failed. so I decided to make it something like this:  
Application Container:

\- CPU: 1.5 cores

\- Memory: 512MB

\- Node.js heap limit: 384MB

PostgreSQL Container:

\- CPU: 1.5 cores

\- Memory: 512MB

\- Shared buffers: 64MB

# Metrics we checked

\- CPU Usage

\- Memory

\- HTTP Performance:

\- Requests per second (RPS)

\- Active connections

\- Request duration (p95, p99 latency)

\- Error breakdown (4xx, 5xx by route and status code)

# Base / First Try

this is the result of first try without optimizations

![](https://substackcdn.com/image/fetch/$s_!7GGF!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F928bbdd6-0f0f-4a08-aca5-76a6a8627a61_708x686.png)

# Moving to Kysely

at first, moving to kysely (query builder) from TypeORM would improve the performance. turns out it not:

![](https://substackcdn.com/image/fetch/$s_!bzyd!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F51ef0e4f-35aa-421a-9ab6-4d9126d43c34_657x712.png)

the result is interesting. because Heap Used Avg and GC duration is seeing improvement 18-20%, but the RPS is lower.

after consulting to GPT, he mention that this is because my CPU bottleneck (which is using argon for password hashing) is way bigger than my memory bottleneck. so that the result might be incorrect.

I think GPT is right, we should address the elephant in the room first, and should test this later. because I don’t want to skew the test, I actually revert all the changes and going back to TypeORM. all the test after this will be using TypeORM after I mentioned rewriting it again later

# Moving to Bun

So my next change is to move the runtime to Bun. yes just the runtime. this is when I found a rather socking result

![](https://substackcdn.com/image/fetch/$s_!4hPh!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd5e0ef74-cf5c-434e-b2ca-25ad158ef185_720x791.png)

you see, even though the Memory Avg and Heap Average is lower than the node runtime counter part. the p95 health check and protected route is way worse than before

Based on the result my suspect is something regarding concurrency, and turns out I am right. see, the library that I use for hashing password, \`node-argon2\` already contain a prebuilt binary. which in the node environment use what so called [N-api](https://nodejs.org/api/n-api.html) ore node api that able to run native addons. meaning it can run prebuilt / native binary.

the node-argon2 itself use this [C argon library](https://github.com/P-H-C/phc-winner-argon2/tree/62358ba2123abd17fccf2a108a301d4b52c01a7c) and wrapped [it with async worker via Napi](https://github.com/ranisalt/node-argon2/blob/master/argon2.cpp) .

honestly I am not sure whether the issue is that Bun not using the prebuilt/native binary at all. or there are some issues related Napi async worker in Bun that make it not really concurrent like in node.

After looking around, I see that Bun has builtin argon password hashing support with Bun.passwords.hash, I decided to move to using that. the result is like this:

![](https://substackcdn.com/image/fetch/$s_!JDXN!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd9d8ef35-d02a-4f52-ba81-0b23bea12213_593x700.png)

it is way way better. than before. you see, the interesting thing when comparing these result with the Node counterpart. the p95 of Create User api is reduced from 8s to 5s, but the health check API p95 jump from just ~100ms to 1200ms. which is really bad.

but regarding the RPS, it is improving though. I deduce it because, even though 100 to 1200ms is 12x slower, it is just 1100 ms difference, while 8000 to 5800 is 2200ms difference. which make sense if the average RPS is better.

but whether which is worth I think it really depends on what we are trying to do / serve.

since this discrepancy between Node and Bun there are really no clear winner, I might also try moving back to Node and do some other improvement. like making it 2 different path. best improvement in bun and best improvement in Node without changing the run time

but for now lets focus improving the Bun part.

btw you might notice that the way I write is like a log / diary instead of a report. because yeah I am currently writing while testing, and I might not edit this.

# Moving to Bun.Serve

![](https://substackcdn.com/image/fetch/$s_!SxIR!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F99248ee9-e847-435f-a64d-c2460e04679f_748x690.png)

again, interesting thing after moving my express js implementation to Bun.serve, you see, the Health check and Protected Route, is worse. while the Create User and Login User is improved. and again, the overall RPS is improved.

# Using Bun thread worker + Semaphore

![](https://substackcdn.com/image/fetch/$s_!hqem!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F38b98e51-ba66-4d9d-88aa-14c16bbf07a4_843x1031.png)

my next attempt was to moving it into what a production app will usually do. first I move the password change into bun worker thread, and then I add Semaphore mechanism and accepting 3 concurrency request max. for why 3 concurrency, I ask the GPT by giving my container specs and ask what concurrency I should use.

So what does it mean? it mean to only spawn maximum 3 worker, and if those worker are occupied while the request came, it throw a SemaphoreFullError, then return back 429 HTTP Error (Too many request) to the client.

it does increase the Failed rate way higher, from 0.64% to 43%. but if you see all latency are coming down. not only the other non-password-hash routes is improving and even better than the node counter part 80 to 60ms for health and 100ms to 77ms. but the success latency for Create User and Login User is also the best. “just” around 200ms, and the RPS? way higher with 63 RPS

you might think the error is bad. that is because we don’t set threshold for the timeout. think about it, the average p95 at best without thread worker and limiting the concurrency is 6 seconds. which make the experience is bad for all users.

I believe in the real world case this would be the happy path, because we can handle 429 in Frontend and saying that the user should try again after few minutes. We can also setup alert to then scale our system based on the error codes and failure rate.

This I think also scale better if we scale our hardware, because we can for example make the variable for the max concurrency is computed based on our CPU and Memory resource, so that when we scale up the max concurrency also increasing

# Moving to Kysely again

remember that all the above is I still using TypeORM. because I want to delay the ORM vs non ORM until the main bottleneck (CPU) is resolved.

since it is now kinda resolved, lets bring it back again. and here is the result

![](https://substackcdn.com/image/fetch/$s_!H7R2!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1e2fa43f-d72e-4c4b-b4be-b0f60b5957a1_914x951.png)

the result is shocking for me. merely changing from ORM to query building reducing

the Failed rate by 4% and reduce the latency by 10-20% ?

I think the hint is in the Memory average. the Memory usage average is reduced for about 15%. and this is while serving more successful request (which mean there are user/password created or more lists to query and then respopnse, etc)

That is why, if you check the memory pressure, it use a litle bit more Heap than using TypeORM. this make sense because by serving more successful request equal to more object created and need to be garbage collected.

# Coming back to Node

as I said earlier, I want to come back to Node again to see, but I think I am already to tired to do incremental testing again, so I will just come up with that I think the most perfomant and test it at once (for example this test already use kysely, not TypeORM)

also I won’t coming back to Express, I will use uWebsocket because it is way faster. even I read somewhere that Bun HTTP is used to be fork of uWebsocket and share same underlying principle. here is the result

![](https://substackcdn.com/image/fetch/$s_!zONi!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8cc7d178-2ca5-4f75-a8dd-a502e953ca70_1012x1050.png)

I think it perform worse than Bun on this case.

# What’s Next?

At first I choose password hashing because I know it computationally expensive. I thought the library is implemented in Node and then I can utilize Napi to see the performance difference of moving computationally expensive process to a native binary written in other language. so if the difference is way way higher then I think I can keep using Node and just write the computationally expensive in other language and access through Napi

but since all argon library I could found already use Napi, then I don’t think I really achieve the goal I set before embarking on this journey. the Argon library I use already use a C language implementation, what could be faster?

so if you are still curious I have 2 suggestion:

1.  search a thing/process that computationally expensive and has a node library that completely implemented in node.js and create a Napi and write the library in other language then compare the result.
    
2.  Create same setup in other language like Golang or even Rust. and see the difference. I think memory wise Golang / Rust would definetely be way better due to the nature of compiled language. what I am interested is the CPU and latency. means in the Create user and Login API. how much does those language does better?
    

I might or might not do one of them.

# Conclusion

like any other benchmark I think it is dangerous to blindly draw conclusion. because there are a lot of nuance depending on what the requirement is or what you are trying to do.

while I am not achieving my initial goal, and doing this benchmark surprise me in lots of occasion, I am still glad I do this because I received other knowledge / information.

for example the most I am not expected is that even though the node argon already use Napi, I don’t know whether it doesn’t implement the Napi Async Worker well or what. but it seems perform worse than Node for a library or npm package that using Napi.

I honestly think in term of handling a concurrent, CPU expensive work, Node is still better than Bun. So maybe if what you are doing is system programming or building some CLI app that utilize CPU a lot, maybe it is better to stay using Node

But, if we are talking about doing backend development. it really is a bit hard to decide. because see, not every developer would think about doing a work in the worker thread or doing some limiting with Semaphore.

and even though bun is serving more RPS, it kinda having some kind of noisy neighbor problem. where the API that is CPU extensive is making other API like health and other protected routes slower. if we are doing a monolith I don’t think this is good.

I think some other simple hello world benchmark failed to see this because it does only response a simple json

But… if we do some optimization in Bun, like limiting the concurrency of the cpu extensive API, the reduce of latency and memory is I think worth it.

Also I am surprised that by using ORM we increase memory footprint by 20%. which in turn reduced RPS, increasing latency (20ms) and increasing error rate (4%) during spike.

it might be not that much for you, maybe it’s a performance tradeoff that you want to take, but for me I think moving forward I’ll prefer to use query builder instead.

if you want to try the benchmark or try to improve something (I am indeed having skill issues) you can see the repo here

https://github.com/hanipcode/bun-node-rest-benchmark

all commit is green commit (on my end at least) meaning you can just jump between commit and test. if you read the message you can kinda relate which commit relate to which part of this article

Alright this experiment is already run too long, it almost the end of the day here.

See you!
