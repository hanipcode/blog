---
title: Benchmark Bun dan Node.js untuk API Pembuatan User dan Login
description: Perbandingan praktis Bun dan Node.js, termasuk hasil mengejutkan seputar password hashing dan concurrency.
publishedAt: '2025-10-12T16:42:39.561Z'
locale: id
translationKey: benchmarking-bun-and-node-for-user
tags:
  - Bun
  - Node.js
  - Backend
  - Performance
draft: false
canonicalUrl: 'https://hanipcode.substack.com/p/benchmarking-bun-and-node-for-user'
originalLocale: en
sourceHash: 1eaa57d71bcff722
---
Jadi, saat ini saya sedang menjalani tantangan untuk meningkatkan backend node/express guna melihat sejauh apa saya bisa mengoptimalkannya, lalu saya akan melakukan benchmark untuk melihat hasil yang bisa dicapai.

url github: https://github.com/hanipcode/bun-node-rest-benchmark (kalau kamu kembali cuma untuk mengambilnya)

# Tujuan

Jadi, saya sendiri biasanya tidak terlalu percaya micro-benchmark. Apalagi kalau membandingkan dua bahasa yang benar-benar berbeda. Karena itu, tujuan yang saya bayangkan untuk benchmark ini adalah mengambil sebuah aplikasi backend dan melihat seberapa cepat aplikasi tersebut bisa saya buat.

Tujuan pribadi saya sebenarnya adalah memutuskan apakah saya akan terus menggunakan TypeScript dengan runtime Node/Bun, atau kalau hasilnya tidak sesuai harapan, saya akan memilih teknologi lain.

Selain itu, dalam percobaan ini saya mungkin tidak ingin menguji hal-hal yang sudah jelas, seperti menambahkan Redis di depan atau mengoptimalkan sisi postgres. Kenapa? Karena itu hanyalah optimasi yang sudah jelas dan bisa kita lakukan dalam bahasa apa pun. Saya ingin melihat seberapa cepat environment node/bun tanpa mengoptimalkan bagian di luar application layer/runtime.

## Backend yang kita uji

Backend yang kita uji adalah aplikasi backend sederhana dengan route autentikasi, menggunakan stack berikut:

\- Application: Node.js 20 + Express + TypeScript

\- Database: PostgreSQL 16 (Alpine)

\- ORM: TypeORM

\- Password Hashing: Argon2 (berat di CPU, libuv threadpool)

\- Authentication: JWT (jsonwebtoken)

\- Monitoring: prom-client (exporter metrics Prometheus)

1kenapa memilih pengujian seperti ini? Karena proses kriptografi seperti hashing password itu intensif dalam penggunaan memory. Saya ingin melihat apakah kita bisa membuatnya cepat di Node/Bun atau tidak. Kita juga akan menguji route yang tidak intensif dalam penggunaan memory. Selain itu, saya ingin menguji overhead ORM dibandingkan penggunaan query builder, terutama yang berkaitan dengan GC pressure.

berikut endpoint-nya

1\. Health Check (GET /health) - Endpoint sederhana untuk memastikan server tetap responsif

2\. User Registration (POST /api/users) - Operasi berat di CPU yang menggunakan Argon2 untuk hashing password

3\. User Authentication (POST /api/users/login) - Verifikasi password dengan Argon2

4\. Protected Routes (GET /api/users) - Endpoint dengan autentikasi JWT yang memerlukan query database

Kamu bisa membayangkannya seperti ini:

1 adalah versi polos atau dasarnya, benar-benar hanya mengirim JSON. Saya menambahkannya karena saya juga ingin menguji pergantian runtime dari Node ke Bun. Jadi saya memerlukan ini,

2 adalah yang paling intensif dalam penggunaan memory karena melakukan hashing password + menyimpannya ke Postgres.

3 yaitu login kurang lebih sama, hanya saja operasinya cuma membaca dari database, bukan menulis ke dalamnya.

4 seharusnya berada di atas 1 tetapi di bawah 2 dan 3, karena ada pembacaan database dan verifikasi jwt, tetapi tidak ada hashing password

## Cara kita menguji

Agar cukup merepresentasikan penggunaan server sungguhan, saya melakukan pengujian menggunakan docker container, bukan langsung di komputer saya.

Awalnya saya mencoba dengan 0.5 CPU dan 256 MB, tetapi 90% request gagal (bahkan sebelum optimasi apa pun). Jadi saya memutuskan untuk membuat konfigurasinya seperti ini:  
Application Container:

\- CPU: 1.5 core

\- Memory: 512MB

\- Batas heap Node.js: 384MB

PostgreSQL Container:

\- CPU: 1.5 core

\- Memory: 512MB

\- Shared buffers: 64MB

# Metrics yang kita periksa

\- Penggunaan CPU

\- Memory

\- Performa HTTP:

\- Request per detik (RPS)

\- Koneksi aktif

\- Durasi request (latency p95, p99)

\- Rincian error (4xx, 5xx berdasarkan route dan status code)

# Versi Dasar / Percobaan Pertama

ini adalah hasil percobaan pertama tanpa optimasi

![](https://substackcdn.com/image/fetch/$s_!7GGF!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F928bbdd6-0f0f-4a08-aca5-76a6a8627a61_708x686.png)

# Beralih ke Kysely

Awalnya, saya mengira beralih dari TypeORM ke kysely (query builder) akan meningkatkan performa. Ternyata tidak:

![](https://substackcdn.com/image/fetch/$s_!bzyd!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F51ef0e4f-35aa-421a-9ab6-4d9126d43c34_657x712.png)

hasilnya menarik. Karena Heap Used Avg dan durasi GC mengalami peningkatan 18-20%, tetapi RPS justru lebih rendah.

Setelah berkonsultasi dengan GPT, dia menyebutkan bahwa bottleneck CPU saya (yang menggunakan argon untuk hashing password) jauh lebih besar daripada bottleneck memory. Jadi, hasilnya mungkin tidak tepat.

Menurut saya GPT benar, kita harus menangani masalah terbesar ini terlebih dahulu dan mengujinya lagi nanti. Karena tidak ingin hasil pengujiannya bias, saya benar-benar me-revert semua perubahan dan kembali ke TypeORM. Semua pengujian setelah ini akan menggunakan TypeORM sampai nanti saya menyebutkan bahwa saya menulis ulang bagian tersebut.

# Beralih ke Bun

Jadi, perubahan saya berikutnya adalah memindahkan runtime ke Bun. Ya, hanya runtime-nya. Di sinilah saya menemukan hasil yang cukup mengejutkan

![](https://substackcdn.com/image/fetch/$s_!4hPh!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd5e0ef74-cf5c-434e-b2ca-25ad158ef185_720x791.png)

Seperti yang kamu lihat, meskipun Memory Avg dan Heap Average lebih rendah daripada runtime node, p95 health check dan protected route jauh lebih buruk daripada sebelumnya

Berdasarkan hasil tersebut, saya menduga ada sesuatu yang berkaitan dengan concurrency, dan ternyata saya benar. Library yang saya gunakan untuk hashing password, \`node-argon2\`, sudah menyediakan prebuilt binary. Di environment node, library ini menggunakan sesuatu yang disebut [N-api](https://nodejs.org/api/n-api.html) atau node api yang bisa menjalankan native addons. Artinya, ia bisa menjalankan prebuilt / native binary.

node-argon2 sendiri menggunakan [C argon library](https://github.com/P-H-C/phc-winner-argon2/tree/62358ba2123abd17fccf2a108a301d4b52c01a7c) dan membungkus [library tersebut dengan async worker melalui Napi](https://github.com/ranisalt/node-argon2/blob/master/argon2.cpp) .

Sejujurnya, saya tidak yakin apakah masalahnya adalah Bun sama sekali tidak menggunakan prebuilt/native binary, atau ada masalah terkait Napi async worker di Bun yang membuatnya tidak benar-benar concurrent seperti di node.

Setelah mencari-cari, saya melihat bahwa Bun punya dukungan bawaan untuk hashing password argon melalui Bun.passwords.hash. Saya pun memutuskan beralih menggunakannya. Hasilnya seperti ini:

![](https://substackcdn.com/image/fetch/$s_!JDXN!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd9d8ef35-d02a-4f52-ba81-0b23bea12213_593x700.png)

Hasilnya jauh, jauh lebih baik daripada sebelumnya. Hal yang menarik ketika membandingkan hasil ini dengan Node adalah p95 API Create User turun dari 8 detik menjadi 5 detik, tetapi p95 API health check melonjak dari hanya ~100ms menjadi 1200ms. Ini benar-benar buruk.

Namun, RPS memang meningkat. Kesimpulan saya, meskipun 100 ke 1200ms berarti 12x lebih lambat, selisihnya hanya 1100ms, sedangkan 8000 ke 5800 memiliki selisih 2200ms. Jadi masuk akal kalau RPS rata-ratanya lebih baik.

Namun, mana yang lebih sepadan menurut saya sangat bergantung pada apa yang sedang kita coba lakukan / layani.

Karena perbedaan antara Node dan Bun ini tidak menghasilkan pemenang yang benar-benar jelas, saya mungkin juga akan mencoba kembali ke Node dan melakukan beberapa peningkatan lain. Misalnya, membuat dua jalur berbeda: peningkatan terbaik di Bun dan peningkatan terbaik di Node tanpa mengganti runtime

Namun untuk sekarang, mari fokus meningkatkan bagian Bun.

btw, kamu mungkin menyadari bahwa cara saya menulis lebih mirip log / diary daripada laporan. Karena ya, saya memang sedang menulis sambil melakukan pengujian, dan mungkin tidak akan mengedit tulisan ini.

# Beralih ke Bun.Serve

![](https://substackcdn.com/image/fetch/$s_!SxIR!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F99248ee9-e847-435f-a64d-c2460e04679f_748x690.png)

Sekali lagi, ada hal menarik setelah memindahkan implementasi express js saya ke Bun.serve. Seperti yang kamu lihat, Health Check dan Protected Route menjadi lebih buruk, sedangkan Create User dan Login User membaik. Dan sekali lagi, RPS keseluruhan meningkat.

# Menggunakan Bun thread worker + Semaphore

![](https://substackcdn.com/image/fetch/$s_!hqem!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F38b98e51-ba66-4d9d-88aa-14c16bbf07a4_843x1031.png)

Percobaan saya berikutnya adalah memindahkannya ke pendekatan yang biasanya digunakan aplikasi production. Pertama, saya memindahkan proses perubahan password ke bun worker thread, kemudian menambahkan mekanisme Semaphore dan hanya menerima maksimal 3 request secara concurrent. Untuk alasan menggunakan 3 concurrency, saya bertanya kepada GPT dengan memberikan spesifikasi container saya dan menanyakan concurrency yang sebaiknya digunakan.

Jadi, apa artinya? Artinya hanya maksimal 3 worker yang dibuat, dan jika semua worker sedang sibuk ketika request masuk, sistem akan melempar SemaphoreFullError, lalu mengembalikan HTTP Error 429 (Too many request) kepada client.

Ini memang meningkatkan Failed rate secara drastis, dari 0.64% menjadi 43%. Namun, kalau dilihat, semua latency menurun. Bukan hanya route non-password-hash lain yang membaik dan bahkan lebih baik daripada Node—80 ke 60ms untuk health dan 100ms ke 77ms—tetapi success latency untuk Create User dan Login User juga menjadi yang terbaik. “Hanya” sekitar 200ms, lalu RPS-nya? Jauh lebih tinggi dengan 63 RPS

Kamu mungkin menganggap error itu buruk. Itu karena kita tidak menetapkan threshold untuk timeout. Coba pikirkan, rata-rata p95 terbaik tanpa thread worker dan pembatasan concurrency adalah 6 detik. Ini membuat pengalaman semua user menjadi buruk.

Saya percaya bahwa dalam kasus nyata, ini justru akan menjadi happy path, karena kita bisa menangani 429 di Frontend dan memberi tahu user untuk mencoba lagi setelah beberapa menit. Kita juga bisa memasang alert, lalu melakukan scale pada sistem berdasarkan error code dan failure rate.

Menurut saya, pendekatan ini juga akan lebih mudah di-scale jika hardware kita ditingkatkan. Misalnya, kita bisa membuat nilai max concurrency dihitung berdasarkan resource CPU dan Memory, sehingga ketika kita scale up, max concurrency juga ikut meningkat

# Beralih ke Kysely Lagi

Ingat bahwa pada semua pengujian di atas saya masih menggunakan TypeORM. Sebab, saya ingin menunda perbandingan ORM vs non-ORM sampai bottleneck utamanya (CPU) teratasi.

Karena sekarang masalahnya kurang lebih sudah teratasi, mari kita hadirkan kembali pengujian itu. Berikut hasilnya

![](https://substackcdn.com/image/fetch/$s_!H7R2!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1e2fa43f-d72e-4c4b-b4be-b0f60b5957a1_914x951.png)

Hasilnya mengejutkan bagi saya. Hanya dengan beralih dari ORM ke query builder bisa menurunkan

Failed rate sebesar 4% dan mengurangi latency sebesar 10-20%?

Menurut saya, petunjuknya ada pada Memory average. Rata-rata penggunaan Memory berkurang sekitar 15%. Padahal, ini terjadi sambil melayani lebih banyak request yang berhasil (artinya ada user/password yang dibuat, lebih banyak daftar yang di-query lalu dikirim sebagai response, dan sebagainya)

Itulah sebabnya, kalau melihat memory pressure, pendekatan ini menggunakan Heap sedikit lebih banyak daripada TypeORM. Ini masuk akal karena melayani lebih banyak request yang berhasil berarti lebih banyak object dibuat dan perlu di-garbage-collect.

# Kembali ke Node

Seperti yang saya katakan sebelumnya, saya ingin kembali ke Node untuk melihat hasilnya. Namun, sepertinya saya sudah terlalu lelah untuk melakukan pengujian secara bertahap lagi, jadi saya langsung menggunakan konfigurasi yang menurut saya paling performant dan mengujinya sekaligus (misalnya, pengujian ini sudah menggunakan kysely, bukan TypeORM)

Selain itu, saya tidak akan kembali ke Express. Saya akan menggunakan uWebsocket karena jauh lebih cepat. Saya bahkan pernah membaca bahwa Bun HTTP dulunya merupakan fork dari uWebsocket dan menggunakan prinsip dasar yang sama. Berikut hasilnya

![](https://substackcdn.com/image/fetch/$s_!zONi!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8cc7d178-2ca5-4f75-a8dd-a502e953ca70_1012x1050.png)

Menurut saya, dalam kasus ini performanya lebih buruk daripada Bun.

# Apa Selanjutnya?

Awalnya saya memilih password hashing karena tahu proses itu mahal secara komputasi. Saya mengira library-nya diimplementasikan menggunakan Node, sehingga saya bisa memanfaatkan Napi untuk melihat perbedaan performa ketika proses yang mahal secara komputasi dipindahkan ke native binary yang ditulis dalam bahasa lain. Jadi, kalau perbedaannya jauh lebih besar, saya rasa saya bisa tetap menggunakan Node dan cukup menulis bagian yang mahal secara komputasi dalam bahasa lain, lalu mengaksesnya melalui Napi

Namun, karena semua library argon yang bisa saya temukan sudah menggunakan Napi, saya rasa tujuan yang ditetapkan sebelum memulai perjalanan ini tidak benar-benar tercapai. Library Argon yang saya gunakan sudah memakai implementasi bahasa C, memangnya apa yang bisa lebih cepat?

Jadi, kalau kamu masih penasaran, saya punya 2 saran:

1.  Cari sesuatu/proses yang mahal secara komputasi dan punya library node yang sepenuhnya diimplementasikan menggunakan node.js, lalu buat Napi dan tulis library tersebut dalam bahasa lain, kemudian bandingkan hasilnya.
    
2.  Buat setup yang sama dalam bahasa lain seperti Golang atau bahkan Rust, lalu lihat perbedaannya. Menurut saya, dari sisi memory, Golang / Rust pasti akan jauh lebih baik karena sifat bahasa yang di-compile. Yang membuat saya tertarik adalah CPU dan latency. Maksudnya, pada API Create User dan Login, seberapa jauh bahasa-bahasa tersebut bisa lebih baik?
    

Saya mungkin akan melakukan salah satunya, atau mungkin juga tidak.

# Kesimpulan

Seperti benchmark lainnya, menurut saya berbahaya jika kita menarik kesimpulan secara membabi buta. Sebab, ada banyak nuansa yang bergantung pada requirement atau apa yang sedang kita coba lakukan.

Meskipun tujuan awal saya tidak tercapai dan benchmark ini berkali-kali mengejutkan saya, saya tetap senang melakukannya karena mendapatkan pengetahuan / informasi lain.

Misalnya, hal yang paling tidak saya duga adalah meskipun node argon sudah menggunakan Napi, saya tidak tahu apakah implementasi Napi Async Worker-nya kurang baik atau apa. Namun, sepertinya Bun berperforma lebih buruk daripada Node untuk library atau npm package yang menggunakan Napi.

Sejujurnya, menurut saya dalam hal menangani pekerjaan concurrent yang berat di CPU, Node masih lebih baik daripada Bun. Jadi, mungkin jika kamu mengerjakan system programming atau membuat aplikasi CLI yang banyak menggunakan CPU, lebih baik tetap menggunakan Node

Namun, kalau kita membahas backend development, keputusannya memang agak sulit. Karena, tidak semua developer akan terpikir untuk menjalankan pekerjaan di worker thread atau menerapkan pembatasan dengan Semaphore.

Meskipun bun melayani lebih banyak RPS, sepertinya ada semacam masalah noisy neighbor. API yang berat di CPU membuat API lain seperti health dan protected route lainnya menjadi lebih lambat. Kalau kita membuat monolith, menurut saya ini kurang bagus.

Menurut saya, beberapa benchmark hello world sederhana lainnya gagal melihat masalah ini karena hanya memberikan response berupa json sederhana

Namun… jika kita melakukan beberapa optimasi di Bun, seperti membatasi concurrency API yang berat di CPU, menurut saya penurunan latency dan memory-nya sepadan.

Saya juga terkejut karena penggunaan ORM meningkatkan memory footprint sebesar 20%. Hal ini kemudian mengurangi RPS, meningkatkan latency (20ms), dan meningkatkan error rate (4%) saat terjadi lonjakan.

Mungkin itu tidak terlalu besar bagi kamu, atau mungkin merupakan performance tradeoff yang ingin kamu ambil. Namun, bagi saya, ke depannya saya rasa akan lebih memilih menggunakan query builder.

Kalau kamu ingin mencoba benchmark ini atau mencoba meningkatkan sesuatu (skill saya memang masih kurang), kamu bisa melihat repo-nya di sini

https://github.com/hanipcode/bun-node-rest-benchmark

Semua commit adalah green commit (setidaknya di sisi saya), artinya kamu bisa langsung berpindah antar-commit dan melakukan pengujian. Kalau membaca pesannya, kamu kurang lebih bisa mencocokkan commit mana yang berkaitan dengan bagian tertentu dalam artikel ini

Baiklah, eksperimen ini sudah berjalan terlalu lama. Di sini hari sudah hampir berakhir.

Sampai jumpa!
