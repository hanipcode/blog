---
title: Sisi Kasar AI Agent untuk Frontend Development Saat Ini
description: Bagian yang masih menyulitkan frontend agent serta perubahan browser dan tooling yang dapat membuatnya lebih andal.
publishedAt: '2025-09-30T14:30:41.652Z'
locale: id
translationKey: rough-edges-of-current-state-of-ai
tags:
  - AI
  - Frontend
  - Developer Tools
draft: false
canonicalUrl: 'https://hanipcode.substack.com/p/rough-edges-of-current-state-of-ai'
originalLocale: en
sourceHash: 7e129c536a0983de
---
Jadi, sejak awal tahun ini saya mulai memasukkan AI ke workflow karena saya mulai merasa kondisinya sudah cukup bagus untuk mengerjakan FE.

Tulisan ini bukan untuk membuat orang enggan memanfaatkan AI, justru sebaliknya. Sekarang AI sudah cukup bagus. Tapi saya ingin mendorongnya lebih jauh. Jadi saya membagikan beberapa temuan dan ide saya. Kalau orang lain mendapat inspirasi atau bahkan mewujudkan ide saya? Mantap! Saya dengan senang hati akan memakai produk itu (kalau harganya cocok di kantong saya, tentunya).

Nah, sebelum ada yang mencoba bilang “mungkin prompt kamu salah”, “perbaiki prompt-nya, saya janji hasilnya bakal lebih bagus”, izinkan saya menjelaskan hal-hal yang sudah saya coba:

1.  meningkatkan prompt saya dengan memberikan contoh
    
2.  melampirkan screenshot ke prompt saya
    
3.  menghubungkan AI ke Figma menggunakan Figma MCP
    
4.  menghubungkan AI ke JIRA menggunakan Atlassian MCP
    
5.  menggunakan Claude.md, Agents.md, dan semua file md lain yang ada di luar sana
    

kalau menurut kamu usaha saya belum cukup, berikut beberapa usaha ekstra yang sudah saya lakukan:

1.  [Membuat MCP untuk design system yang digunakan perusahaan saya](https://www.linkedin.com/posts/hanifeij_so-ive-said-that-the-one-thing-i-hate-working-activity-7334250075075817472-Urky?utm_source=share&utm_medium=member_desktop&rcm=ACoAABoUOM0BkLUeQXNZpMzPnalLhTTQCgXGGS8) yang ternyata sangat saya harapkan hasilnya.
    
2.  [Menyesuaikan dan memperluas plugin AI yang saya gunakan di editor](https://github.com/olimorris/codecompanion.nvim/discussions/1013#discussioncomment-12735567) ([code lengkap](https://github.com/hanipcode/nvim/blob/main/lua/hanipcode/local/adapter.lua)) (btw saya pakai neovim)
    
3.  [Bahkan menjajaki pembuatan browser sendiri yang punya MCP bawaan](https://www.linkedin.com/posts/hanifeij_there-is-currently-no-browser-yet-that-has-activity-7363487006770802689-U4vF?utm_source=share&utm_medium=member_desktop&rcm=ACoAABoUOM0BkLUeQXNZpMzPnalLhTTQCgXGGS8)
    

Jadi, kalau semua itu belum cukup meyakinkan kamu betapa saya ingin ini berhasil, saya juga nggak tahu apa lagi.  
Saya ingin menjalani mimpi itu, ketika saya bisa memberi AI prompt berisi desain, lalu AI mampu melakukan debug sendiri, mengambil screenshot, membandingkannya dengan screenshot di Figma, dan memperbaiki perbedaan desain sementara saya menonton drama China di aplikasi random.

## Tapi.. Saya sudah mencoba Lovable/Bolt/Replit dan itu keren

pertama-tama, bagus buat kamu.

Tapi saya rasa perlu menjelaskan jenis project/environment yang saya gunakan untuk menguji semua upaya yang tadi saya sebutkan.

Jadi, saat ini saya bekerja di perusahaan yang punya Design System dan dipublikasikan sebagai private package.

Lalu saya bekerja di sebuah monorepo yang terdiri dari beberapa dashboard yang dibuat menggunakan Next.js, dengan total LoC di repo github (tidak termasuk directory dan file yang masuk gitignore) sekitar 300 ribu baris.

Saya rasa cukup aman untuk bilang bahwa yang ingin saya lakukan adalah hal yang juga ingin dilakukan oleh pekerja FE biasa di sebuah perusahaan.

oke, mari lanjut ke daftar masalah yang saya temukan

## MCP dan kisah tentang tidak jelasnya berapa banyak context yang diinginkan AI

![Sell this pen - It's MCP-Powered](https://substackcdn.com/image/fetch/$s_!hUyA!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F76353668-3d36-4d99-abb2-4174993ae72d_1000x1080.gif)

[sumber](https://www.linkedin.com/posts/leadgenmanthan_mcp-is-the-http-of-ai-mcp-is-doing-for-ai-activity-7314495756550209537-C3TW/)

ini mungkin masalah umum dan sepertinya sudah diketahui luas

context terlalu sedikit → AI nggak tahu harus berbuat apa → AI berhalusinasi

context terlalu banyak → AI bingung harus berbuat apa → AI berhalusinasi

inilah yang terjadi saat saya bereksperimen pada masa awal hype MCP dan semua orang membuat MCP untuk segala hal. Saya mencoba menghubungkan cursor ke semua yang bisa saya akses: Jira, Figma, Notion, bahkan membuat MCP sendiri yang disebutkan di atas.

Saya mencoba bereksperimen di project kosong menggunakan FE starter pack perusahaan saya (sebuah aplikasi react kosong yang sudah dipasangi DS kami)

Lalu saya membandingkan beberapa iterasi seperti ini :

1.  tanpa MCP apa pun
    
2.  dengan MCP DS (Design System) kami
    
3.  hanya Figma MCP
    
4.  DS MCP + Figma MCP
    
5.  DS MCP + Figma MCP + JIRA MCP
    
6.  DS MCP + Figma MCP + JIRA MCP + Notion PRD
    

ternyata, setidaknya saat itu, nomor 2 adalah titik paling pas. setelah menambahkan Figma, AI mulai berhalusinasi.

Sebagai contoh, AI bingung harus menggunakan sumber kebenaran yang mana, apakah instruksi di Design System MCP atau data yang didapat dari memeriksa Figma.

Tapi yang mengejutkan saya, nomor 2 lebih bagus daripada nomor 3. ya, saya mencoba hanya memberikan Figma MCP ke AI dan hasilnya malah memburuk. Karena sebenarnya ada terlalu banyak noise di node/object Figma.

Salah satu masalah yang saya temukan adalah frame/component bertingkat di Figma. Saya mencoba memberikan link seluruh layar kepada AI, tapi AI hanya bisa menjangkau kedalaman 2 sampai 3 tingkat.  
Artinya, anggap saja path component Button kamu terlihat seperti

Page Frame → Modal → Modal Body → Form → Form Action → Button

maka AI bahkan nggak bisa menjangkaunya untuk mendapatkan style Button itu. belum lagi sebuah component Button di Figma bisa terlihat seperti  
Button → Button Icon → Icon → Actual svg

lihat? node Figma begitu dalam sampai-sampai kabarnya Adele sedang rolling di dalam salah satu node itu

Tapi sejujurnya saya juga nggak bisa menyalahkan AI. karena memang sulit mendefinisikan desain secara terstruktur dengan bahasa alami. bahkan kita sebagai manusia biasanya menggeneralisasi saat menjelaskan desain yang kita lihat, seperti bilang “ada beberapa link di bagian atas”, alih-alih “Link-nya berjarak 24px dari tepi atas viewport, masing-masing memiliki gap 8px, dan urutannya adalah … “

potensi solusinya sebenarnya adalah tool perantara antara Figma dan AI, yang bisa menerjemahkan semua node di dalam frame/layar Figma menjadi data yang lebih ringkas dan bebas noise untuk diterjemahkan menjadi code

oh dan tolong, maksud saya bukan menaruh AI agent lain di tengah. karena:

1.  sulit membuatnya deterministik, apalagi kalau yang dilakukan AI itu cuma merangkum tampilan
    
2.  nggak setiap langkah harus ditangani oleh agent. Menurut saya ini
    

otak manusia sebenarnya luar biasa dalam menggeneralisasi sesuatu dan secara tidak sadar mengisi kekosongan.

yang membawa kita ke sisi kasar berikutnya

## sebenarnya sangat sulit bagi AI untuk memahami cara menerjemahkan visual menjadi code

ini berkaitan dengan cara AI sebenarnya melihat.

AI sebenarnya nggak bisa melihat seperti kita manusia. yang dilakukan AI adalah mengubah gambar menjadi embedding, lalu mencoba menyimpulkan code berdasarkan kemiripan dengan training data-nya.

lihat, AI menghasilkan code berdasarkan kemiripan, sedangkan di frontend kita biasanya mengejar desain yang pixel perfect berdasarkan file Figma yang diberikan.

ini mungkin juga alasan pengalaman indiehacking berbeda dengan pengalaman bekerja di perusahaan. kalau nggak ada desain yang harus dicocokkan dan AI dibiarkan menentukan desainnya, tentu saja itu lebih mudah bagi AI

Menurut saya, masalah ini sendiri mungkin yang membuat FE engineer manusia masih lebih sulit digantikan. Kecuali perusahaan ingin menyingkirkan tim desainnya dan membiarkan AI mengerjakan desain.

solusinya saya rasa masih sama dengan poin di atas, kita membutuhkan sesuatu di tengah antara visual dan AI. lalu membuat AI tahu cara menerjemahkan data tersebut menjadi HTML/React.

tapi ini juga membawa kita ke masalah berikutnya

### Library internal atau design system menjadi penghambat, bukannya membantu AI

sekali lagi, karena AI dilatih menggunakan data umum, susahnya minta ampun untuk membuatnya memahami cara menggunakan design system internal kita.

Nggak usah membahas bagaimana AI bisa memahami design system internal kita. bahkan mengarahkannya untuk MENGGUNAKAN design system itu sendiri saja sulit.

bahkan dengan panduan di claude.md yang memiliki catatan IMPORTANT untuk menggunakan design system, AI masih memakai Html/tailwind untuk membuat UI.

setelah sedikit menggali serta melakukan trial and error, saya lumayan paham apa masalahnya. masalahnya adalah AI itu sendiri nggak tahu component apa saja yang tersedia.

Kalaupun AI tahu component apa saja yang tersedia, AI nggak tahu API dari component tersebut, misalnya oke, ada props “variant”. tapi apa saja value yang bisa digunakan?

untuk masalah ini saya lumayan berhasil menyelesaikan sebagian. pertama, saya menambahkan folder project design system. lalu di repo design system saya menggunakan storybook dan punya dokumentasi yang sangat lengkap. dan saat saya bilang lengkap, maksud saya.. LENGKAP. misalnya saya meminta Claude menghasilkan contoh story untuk setiap kemungkinan kombinasi case/props

hal kedua yang saya lakukan untuk mengatasinya adalah membuat docs (tentu saja dengan AI) di folder tingkat project tentang cara mengimplementasikan setiap component, lengkap dengan referensi penggunaan nyata di dalam project. misalnya saya punya ini

![](https://substackcdn.com/image/fetch/$s_!cH8V!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc66fdf20-be59-4e3f-a9e4-4ac618c34bb9_462x82.png)

dengan isi kurang lebih

![](https://substackcdn.com/image/fetch/$s_!h1J2!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe00dd460-f504-46c6-9c1d-f1e710da5e3b_1116x748.png)

Kamu tahu, bahkan dengan semua upaya ini terkadang saya masih menemukan kasus ketika AI menggunakan props yang salah seperti `<Button variant="ghost" />` padahal nggak ada variant “ghost” di component Button saya. atau terkadang AI bahkan masih sama sekali nggak menggunakan design system internal..

ada yang bilang AI setara dengan junior engineer, kalau saya mempekerjakan junior engineer lalu dia melakukan hal itu meski sudah diberi semua data dan contoh tadi, saya akan mencabut aksesnya ke repo project.

tapi ya, ketika kasus tertentu itu muncul, docs yang tadi kita buat jadi berguna karena kita cukup bilang “implementasi kamu salah, periksa lagi docs-nya!” lalu dia akan memeriksa docs dan biasanya implementasinya jadi lebih baik serta menggunakan design system

Sejujurnya saya rasa nggak ada solusi generik untuk ini. Menurut saya satu-satunya hal yang bisa memperbaikinya adalah melakukan fine-tuning model AI dengan codebase perusahaan kita.  
kamu mungkin berpikir “kenapa nggak ditambahkan ke system prompt”, tapi itu akan menghabiskan context window.

Mungkin di masa depan ada solusi untuk ini, seperti context window menjadi begitu besar sampai menaruhnya di sana bukan lagi masalah, atau AI menjadi begitu pintar sehingga kalau sudah diberi docs dan contoh, AI nggak pernah berhalusinasi lagi.

### AI masih terus melakukan over-engineering

dalam kondisinya saat ini, saya merasa AI masih melakukan over-engineering dan juga cenderung membuat lebih banyak code daripada yang dibutuhkan.

Saya rasa masalahnya adalah ketika requirement yang kita berikan samar, entah kenapa AI mencoba terlalu banyak berpikir daripada menyederhanakannya.

btw ini bahkan terjadi setelah saya punya bagian khusus di CLAUDE.md dan secara spesifik meminta AI untuk selalu menulis implementasi sederhana serta nggak mengimplementasikan apa pun yang tidak diminta

salah satu contohnya adalah ketika saya ingin mengimplementasikan sistem hotkey di web app.

AI jadi liar dan melakukan hal-hal seperti:

1.  code yang sangat rumit untuk mendeteksi OS karena rupanya AI menganggap user agent nggak bisa diandalkan lantaran bisa diedit
    
2.  mendeteksi focus browser saat ini
    
3.  mendeteksi perubahan penetapan hotkey
    
4.  dan mungkin pemeriksaan rumit lainnya
    

dan bagi saya itu gila. yah, mungkin ini karena AI begitu pintar, tapi menurut saya cara AI menghubungkan titik-titik pengetahuannya tidak begitu bagus

misalnya, ya, user agent nggak bisa diandalkan, tapi ini untuk hotkey, bukan untuk semacam fraud detection. Sebagian besar user nggak akan sengaja mengubah user agent mereka. kenapa AI menghubungkan pengetahuan soal edge case user agent itu dengan kasus pembuatan fitur hotkey?

lalu soal deteksi focus browser saat ini, saya rasa itu untuk menangani edge case yang sangat langka ketika input sedang focus dan kita mendefinisikan ulang hotkey yang juga digunakan di dalam input (bayangkan cmd +c dan cmd+v)

tapi saya juga nggak membutuhkannya karena saya nggak akan menetapkan hotkey untuk kombinasi tersebut.

ada idiom software engineer YAGNI (You ain’t gonna need it), dan saya mengikutinya sepenuh hati, saya berharap AI agent saya juga begitu. Saya bahkan merasa lebih baik untuk *undershoot* daripada *overshoot*. tapi sebagian orang mungkin punya pendapat berbeda, jadi ya, ini membuat pembuatan AI agent generik yang bisa memuaskan semua orang menjadi sulit.

Sebenarnya saya rasa masalah ini juga berkaitan dengan bagaimana saya bisa memeriksa/memverifikasi apakah implementasinya sudah benar atau cukup di browser, yang membawa kita ke poin berikutnya

### Automated browser test itu susaaaaah banget

Jadi yang saya pikirkan adalah betapa indahnya kalau AI bisa menjalankan development feedback loop yang biasanya dilakukan manusia ini:

1.  periksa figma
    
2.  implementasikan code
    
3.  periksa browser dan lihat apakah implementasinya benar
    
4.  perbaiki masalah, lalu kembali ke poin 1 atau 3
    

sejauh ini satu-satunya masalah adalah poin 3. dan ini bahkan sama sekali nggak berkaitan dengan AI itu sendiri.

kalau pernah melakukan browser automation, kamu pasti tahu. browser automation seperti playwright sebenarnya melakukan berbagai hal melalui debugger protocol.

jadi misalnya, hal seperti “mengklik” element sebenarnya tidak sama dengan ketika user benar-benar mengkliknya. ada banyak kasus ketika kita meminta playwright mengklik suatu element dan ternyata gagal.

belum lagi saat ini kita punya masalah terkait combobox. banyak combobox di sebagian besar website saat ini tidak diimplementasikan menggunakan `<select>` dan `<option>`. dan dibuat menggunakan div serta input, dengan pengelolaan focus yang cuma mereka dan Tuhan yang tahu.

kalau pernah bekerja dengan combobox yang search-nya berada di dalam menu list alih-alih di input value seperti di bawah ini, kamu pasti tahu betapa menyakitkannya mengelola focus karena biasanya combobox akan menggunakan kondisi seperti membuka menu list berdasarkan focus input value container. dan sekarang pada dasarnya combobox itu punya 2 component input, sementara browser hanya memberikan focus ke 1 element

![](https://substackcdn.com/image/fetch/$s_!JYK7!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1c19256f-f207-4a49-801e-8860acf46253_354x434.png)

Saya mencoba segala cara agar dropdown ini bisa dibuka, ya, semua yang terpikirkan oleh saya:

1.  menggunakan function Playwright \`click\`
    
2.  menggunakan browser selector lalu mencoba element.click()
    
3.  bahkan ketika membuat browser sendiri (electron browser), saya mencoba menggunakan sendInputEvent
    

nggak ada yang berhasil.

ini baru satu kasus. kasus lainnya berkaitan dengan login. banyak login web saat ini menggunakan SSO, passkeys, dan sebagainya yang sulit diotomatisasi dalam isolated environment seperti Playwright / puppeteer. solusinya adalah kita perlu mengujinya di browser yang kita gunakan sehari-hari, bukan di isolated environment.

kasus inilah yang membuat saya tadi menciptakan browser sendiri. tapi sebenarnya ada kabar baik terkait hal ini. [Chrome sekarang hadir dengan MCP bawaan](https://developer.chrome.com/blog/chrome-devtools-mcp)

tapi MCP itu masih menggunakan debugger protocol, jadi masalah yang sama terkait simulasi klik user masih akan tetap ada. Menurut saya solusi sebenarnya adalah browser, desktop app, atau bahkan MCP yang bisa *mengemulasikan* klik user di level yang lebih rendah atau di level OS. salah satu contoh library-nya adalah [NutJS](https://nutjs.dev/)

### Cara AI memilih tool tidak deterministik

sekarang, untuk menutup daftar sisi kasar ini, saya ingin membagikan pengalaman saat membuat browser yang punya MCP internal.

Menurut saya AI tidak sepintar itu saat memilih tool yang akan digunakan.

misalnya saya menyediakan tool untuk klik di browser. tapi ada juga tool lain yang memungkinkan AI menjalankan JS.

masih sering sekali AI terus menggunakan execute JS untuk membuat custom script yang melakukan *element.click* alih-alih memakai tool klik browser yang saya sediakan, padahal tool klik browser saya lebih baik karena menggunakan API internal electron.

Saya rasa hal semacam ini bahkan terjadi saat saya menggunakan Claude code. Saya memperhatikan terkadang AI menggunakan bash script untuk membaca file, bukannya tool read file dari claude code. terkadang AI menggunakan \`grep\`, terkadang menggunakan \`rg\`. nggak jelas bagaimana AI memutuskan tool yang dipilih.

untuk kasus browser, saya pikir ini bisa diselesaikan dengan sedikit engineering, misalnya alih-alih memberikan semua tool yang ada, kita perlu membuat system prompt mendetail tentang cara menggunakan berbagai tool tersebut. tapi kekurangannya, ini akan menghabiskan context window secara signifikan. atau mungkin, alih-alih memberikan tool browser secara langsung, browser seharusnya punya AI internal, dan MCP tool hanya digunakan oleh AI eksternal untuk berkomunikasi dengan AI internal browser yang memiliki system prompt mendetail tentang cara mengotomatiskan browser, atau bahkan secara khusus dilatih/di-fine-tune untuk itu.

## Kesimpulan

jadi, apakah saya menyarankan untuk tidak menggunakan AI? tentu saja tidak. Sebenarnya, berdasarkan perjalanan saya, kalau ada satu manfaat yang perlu saya sebutkan, manfaatnya adalah saya jadi lebih memahami cara kerja AI dan semakin pandai membedakan task mana yang sebaiknya saya serahkan kepada AI dan task mana yang lebih baik saya tangani sendiri.

Kesimpulan saya, setidaknya bagi saya, AI dalam kondisinya saat ini hanyalah code generator yang sangat pintar. Saya nggak ingin AI “berpikir” untuk saya. Saya biasanya menggunakannya untuk task yang membosankan seperti refactoring, menyiapkan boilerplate halaman sebelum saya mengerjakannya sendiri, memperbarui package, dan sebagainya.

dalam hal ini AI sebenarnya sangat membantu dalam Frontend development. karena ada banyak code boilerplate di FE. misalnya kalau mengerjakan dashboard, banyak halaman biasanya “terlihat” sama, tapi bagian internalnya bisa sangat berbeda, misalnya sebagian search menggunakan API, sebagian menggunakan local search. sebagian table punya pagination, sebagian tidak. itulah sebabnya *composition over configuration* dalam desain API component seperti Radix/ShadcnUI menjadi sangat populer belakangan ini. bahkan Tanstack Table menggunakan pendekatan serupa.

ini menghasilkan banyak code boilerplate yang sangat bisa dibantu AI dan memang sangat dikuasainya.

ini menutup perjalanan saya atau hal-hal yang bersedia saya lakukan untuk mengoptimalkan pekerjaan saya saat ini. karena menurut saya solusi yang disebutkan di atas terlalu besar untuk saya / saya cuma nggak mau mencurahkan usaha sebanyak itu untuk membuatnya.

tapi ya, kalau di masa depan mimpi saya bisa terwujud dan AI mampu menjalankan feedback loop manusia dalam mengerjakan pekerjaan saya, saya akan sangat senang!
