import type { Locale } from "@lib/i18n";

export const identity = {
  name: "Muhammad Hanif",
  location: "Jakarta, Indonesia",
  email: "hanifeij@yahoo.co.id",
  github: "https://github.com/hanipcode",
  linkedin: "https://linkedin.com/in/hanifeij",
} as const;

const sharedMetrics = ["10+", "1M", "40%", "3+"] as const;

export const profileByLocale = {
  en: {
    metaTitle: "Muhammad Hanif | Lead Software Engineer",
    metaDescription:
      "Lead software engineer building products users love and scalable foundations across frontend, backend, and engineering teams.",
    hero: {
      eyebrow: "Lead software engineer / Jakarta",
      headline: "I build products users love and systems teams can scale.",
      introduction:
        "I work across the stack and shape foundations and culture that help the product and the team scale.",
      primaryCta: "See selected work",
      secondaryCta: "Start a conversation",
      socialLabel: "Professional profiles",
      availability:
        "Open to lead engineering roles and selected consulting work",
      mapLabel: "What I build",
      mapHint: "Frontend / backend / teams",
    },
    metricsLabel: "Selected career outcomes",
    metrics: [
      { value: sharedMetrics[0], label: "years building products" },
      { value: sharedMetrics[1], label: "peak daily game users" },
      { value: sharedMetrics[2], label: "smaller game bundle" },
      { value: sharedMetrics[3], label: "years leading frontend engineers" },
    ],
    work: {
      eyebrow: "Selected work",
      title: "Better products. Stronger foundations.",
      introduction:
        "Three examples of improving the experience for users and the foundations that help teams keep shipping.",
      problem: "What was needed",
      response: "What I changed",
      result: "What improved",
      outcome: "Impact",
      systemPath: "How it connects",
      tagsLabel: "Technologies and disciplines",
    },
    caseStudies: [
      {
        company: "Xenith",
        role: "Lead Frontend Engineer",
        title:
          "Building delightful products for merchants, their users, and the people managing the platform.",
        summary:
          "Joined as the founding engineer, shaping a foundation that scaled across three products while growing the team and building a strong engineering culture.",
        problem:
          "Two dashboards and one end-user product needed a consistent experience, shared frontend standards, and reliable releases as the platform grew.",
        response:
          "Built Xenith UI, the frontend monorepo, engineering standards, and CI/CD; managed frontend delivery through S3, CloudFront, and Route53; and added Node.js BFF APIs.",
        result:
          "Three products now share the same design system, monorepo, standards, and release foundations, giving engineers one place to maintain the frontend platform.",
        outcome: "Building the team and the product from the groundwork into scale",
        diagram: [
          "2 dashboards + end-user product",
          "Xenith UI + monorepo",
          "CI/CD + AWS edge + Node.js BFF",
        ],
        tags: ["Design system", "Monorepo", "Node.js BFF", "CloudFront"],
      },
      {
        company: "Shopee Games",
        role: "Expert Engineer / Team Lead",
        title:
          "Keeping a regional game platform fast for one million daily users.",
        summary:
          "Led five engineers building and operating a React-based Monopoly game across independently released regions.",
        problem:
          "Players across regions needed different campaigns and game versions, while active campaigns had to keep running during new releases.",
        response:
          "Led five engineers and built the frontend multiversion library and Webpack foundation so regions could release independently with lighter bundles.",
        result:
          "Supported one million daily users at peak, reduced bundle size by 40 percent, and reduced deployments blocked by active campaigns by 50 percent.",
        outcome: "1M daily users / 40% smaller bundle",
        diagram: ["Regional builds", "Version router", "Independent releases"],
        tags: ["React", "Webpack", "Delivery systems", "Leadership"],
      },
      {
        company: "Gojek / Midtrans",
        role: "Senior Frontend Engineer",
        title: "Making \"moving fast without breaking things\" happen.",
        summary:
          "Helped move a mature Rails merchant dashboard toward React while merchants and the product team continued using the existing application.",
        problem:
          "Merchants still depended on the Rails product while the team needed a safer path to modern React interfaces and better frontend development workflows.",
        response:
          "Built bridge components for React inside Rails, contributed Asphalt design-system components, replaced CRA with custom Webpack, improved CI/CD, and guided frontend testing practices.",
        result:
          "The team could introduce React incrementally without disrupting merchant workflows or stopping feature delivery in the existing product.",
        outcome: "React migration without disrupting merchants",
        diagram: [
          "Rails merchant dashboard",
          "React bridge + Asphalt",
          "Incremental modernization",
        ],
        tags: ["React", "Rails", "Webpack", "Design system"],
      },
    ],
    workingRange: {
      items: [
        {
          title: "Product experiences",
          tools: "React, React Native, design systems",
        },
        {
          title: "Frontend foundations",
          tools: "Monorepos, standards, CI/CD",
        },
        {
          title: "Backend and APIs",
          tools: "Node.js BFFs, APIs, SQL",
        },
        {
          title: "Engineering teams",
          tools: "Technical direction, mentoring, delivery",
        },
      ],
    },
    consulting: {
      eyebrow: "Consulting",
      title: "Focused work. Meaningful improvements.",
      introduction:
        "I work with product teams on focused improvements across product interfaces, engineering foundations, delivery, and team practices.",
      items: [
        {
          company: "Ieko Media",
          role: "Full-stack Engineer Consultant",
          period: "Three-month engagement",
          title:
            "Lower infrastructure cost, faster releases, and clearer engineering foundations.",
          introduction:
            "Worked across frontend, backend, and DevOps while mentoring the engineering team and replacing an increasingly expensive managed platform.",
          metrics: [
            { value: "$700+ → <$100", label: "monthly infrastructure cost" },
            { value: "10 → 5 min", label: "deployment time" },
          ],
          description:
            "Moved the platform to Docker, Caddy, Portainer, and a DigitalOcean Droplet; introduced automated CI/CD; and created a reusable monorepo foundation with shared development guidelines.",
          tags: ["Full stack", "DevOps", "Monorepo", "Mentoring"],
        },
        {
          company: "DesignFiles.co",
          role: "Frontend Engineer Consultant",
          period: "Jun 2021 - Dec 2022",
          title: "Bringing modern product experiences to a mature Rails stack.",
          introduction:
            "Worked as the company’s only frontend consultant inside a mature Rails codebase, using Ruby templates, Sass, Gulp, and vanilla JavaScript without relying on a framework rewrite.",
          metrics: [],
          description:
            "Made the core application responsive across mobile and desktop and built an interactive video-tutorial experience, delivering modern UX within the constraints of a proven legacy stack.",
          tags: [
            "Ruby templates",
            "Sass",
            "Gulp",
            "Vanilla JavaScript",
            "Legacy modernization",
          ],
        },
      ],
    },
    career: {
      eyebrow: "Career",
      title: "A decade across products, platforms, and teams.",
      introduction:
        "Recent roles are shown in detail; earlier work traces the path from mobile SDKs to technical leadership.",
      earlierLabel: "Earlier work",
      items: [
        {
          company: "Xenith",
          role: "Lead Frontend Engineer / Full-stack Engineer",
          period: "May 2024 - Present",
          description:
            "Cross-border payments, design systems, frontend monorepos, Node.js BFF APIs, and frontend delivery on AWS.",
        },
        {
          company: "Fungsi",
          role: "Founder / Independent AI Engineer",
          period: "Nov 2025 - May 2026",
          description:
            "An independent lab for coding agents, AI gateways, application deployment, and low-cost infrastructure.",
        },
        {
          company: "Gojek / Midtrans",
          role: "Senior Frontend Engineer",
          period: "Apr 2022 - Jun 2023",
          description:
            "Payment product modernization and incremental frontend migration.",
        },
        {
          company: "Shopee Games",
          role: "Expert Software Engineer / Team Lead",
          period: "Apr 2020 - Jan 2022",
          description:
            "High-traffic game systems, regional delivery, performance, and team leadership.",
        },
      ],
      earlier:
        "Earlier work included property platforms, React Native commerce products, and a live-streaming app with a custom native iOS beauty-filter module.",
    },
    writing: {
      eyebrow: "Writing",
      title: "Notes from the workbench.",
      introduction:
        "Experiments, systems, and lessons that became clearer once written down.",
      viewAll: "Browse every article",
      empty: "New essays are being drafted. The archive will live here.",
    },
    contact: {
      eyebrow: "Start a conversation",
      title: "Building a product that needs to scale?",
      description:
        "I’m open to lead engineering roles and selected consulting work across frontend, backend, platform foundations, and delivery.",
      action: "Email me",
      emailLabel: "Or email directly",
      copyEmail: "Copy email address",
      copied: "Email copied",
    },
  },
  id: {
    metaTitle: "Muhammad Hanif | Lead Software Engineer",
    metaDescription:
      "Lead software engineer yang membangun produk yang disukai pengguna dan fondasi yang skalabel di frontend, backend, dan tim engineering.",
    hero: {
      eyebrow: "Lead software engineer / Jakarta",
      headline:
        "Saya membangun produk yang disukai pengguna dan sistem yang skalabel.",
      introduction:
        "Saya bekerja di seluruh stack serta membentuk fondasi dan budaya yang membantu produk dan tim berkembang.",
      primaryCta: "Lihat karya pilihan",
      secondaryCta: "Mulai percakapan",
      socialLabel: "Profil profesional",
      availability:
        "Terbuka untuk peran lead engineering dan proyek konsultasi pilihan",
      mapLabel: "Yang saya bangun",
      mapHint: "Frontend / backend / tim",
    },
    metricsLabel: "Hasil pilihan sepanjang karier",
    metrics: [
      { value: sharedMetrics[0], label: "tahun membangun produk" },
      { value: sharedMetrics[1], label: "pengguna game harian di puncak" },
      { value: sharedMetrics[2], label: "bundle game lebih kecil" },
      { value: sharedMetrics[3], label: "tahun memimpin engineer frontend" },
    ],
    work: {
      eyebrow: "Karya pilihan",
      title: "Produk yang lebih baik. Fondasi yang lebih kuat.",
      introduction:
        "Tiga contoh peningkatan pengalaman pengguna dan fondasi yang membantu tim terus mengembangkan produk.",
      problem: "Yang dibutuhkan",
      response: "Yang saya ubah",
      result: "Yang membaik",
      outcome: "Dampak",
      systemPath: "Bagian yang terhubung",
      tagsLabel: "Teknologi dan disiplin",
    },
    caseStudies: [
      {
        company: "Xenith",
        role: "Lead Frontend Engineer",
        title:
          "Membangun produk yang menyenangkan bagi merchant, pengguna mereka, dan orang-orang yang mengelola platform.",
        summary:
          "Bergabung sebagai founding engineer, membentuk fondasi yang berkembang untuk tiga produk sekaligus menumbuhkan tim dan membangun budaya engineering yang kuat.",
        problem:
          "Dua dashboard dan satu produk end-user membutuhkan pengalaman yang konsisten, standar frontend bersama, dan proses rilis yang andal seiring pertumbuhan platform.",
        response:
          "Membangun Xenith UI, monorepo frontend, standar engineering, dan CI/CD; mengelola delivery frontend melalui S3, CloudFront, dan Route53; serta menambahkan BFF API dengan Node.js.",
        result:
          "Tiga produk kini memakai design system, monorepo, standar, dan fondasi rilis yang sama sehingga engineer memiliki satu tempat untuk memelihara platform frontend.",
        outcome: "Membangun tim dan produk dari fondasi hingga berkembang dalam skala besar",
        diagram: [
          "2 dashboard + produk end-user",
          "Xenith UI + monorepo",
          "CI/CD + AWS edge + BFF Node.js",
        ],
        tags: ["Design system", "Monorepo", "BFF Node.js", "CloudFront"],
      },
      {
        company: "Shopee Games",
        role: "Expert Engineer / Team Lead",
        title:
          "Menjaga platform game regional tetap cepat untuk satu juta pengguna harian.",
        summary:
          "Memimpin lima engineer yang membangun dan mengoperasikan game Monopoly berbasis React di berbagai region.",
        problem:
          "Pemain di setiap region membutuhkan campaign dan versi game yang berbeda, sementara campaign aktif harus tetap berjalan selama rilis baru.",
        response:
          "Memimpin lima engineer serta membangun library multiversi frontend dan fondasi Webpack agar setiap region dapat merilis secara mandiri dengan bundle yang lebih ringan.",
        result:
          "Mendukung satu juta pengguna harian di puncak, mengurangi ukuran bundle sebesar 40 persen, dan mengurangi deployment yang terhambat campaign aktif sebesar 50 persen.",
        outcome: "1 juta pengguna / bundle 40% lebih kecil",
        diagram: ["Build regional", "Router versi", "Rilis independen"],
        tags: ["React", "Webpack", "Sistem delivery", "Leadership"],
      },
      {
        company: "Gojek / Midtrans",
        role: "Senior Frontend Engineer",
        title: "Mewujudkan prinsip \"bergerak cepat tanpa merusak banyak hal\".",
        summary:
          "Membantu mengalihkan dashboard merchant Rails yang matang menuju React sementara merchant dan tim produk tetap menggunakan aplikasi yang ada.",
        problem:
          "Merchant masih bergantung pada produk Rails sementara tim membutuhkan jalur yang aman menuju antarmuka React dan workflow pengembangan frontend yang lebih baik.",
        response:
          "Membangun komponen jembatan React di dalam Rails, berkontribusi pada komponen Asphalt, mengganti CRA dengan Webpack khusus, memperbaiki CI/CD, dan membimbing praktik testing frontend.",
        result:
          "Tim dapat memperkenalkan React secara bertahap tanpa mengganggu workflow merchant atau menghentikan delivery fitur pada produk yang ada.",
        outcome: "Migrasi React tanpa mengganggu merchant",
        diagram: [
          "Dashboard merchant Rails",
          "Jembatan React + Asphalt",
          "Modernisasi bertahap",
        ],
        tags: ["React", "Rails", "Webpack", "Design system"],
      },
    ],
    workingRange: {
      items: [
        {
          title: "Pengalaman produk",
          tools: "React, React Native, design system",
        },
        {
          title: "Fondasi frontend",
          tools: "Monorepo, standar, CI/CD",
        },
        {
          title: "Backend dan API",
          tools: "BFF Node.js, API, SQL",
        },
        {
          title: "Tim engineering",
          tools: "Arahan teknis, mentoring, delivery",
        },
      ],
    },
    consulting: {
      eyebrow: "Konsultasi",
      title: "Kerja terarah. Peningkatan yang bermakna.",
      introduction:
        "Saya membantu tim produk melakukan peningkatan terarah pada antarmuka produk, fondasi engineering, delivery, dan cara kerja tim.",
      items: [
        {
          company: "Ieko Media",
          role: "Konsultan Full-stack Engineer",
          period: "Proyek tiga bulan",
          title:
            "Biaya infrastruktur lebih rendah, rilis lebih cepat, dan fondasi engineering lebih jelas.",
          introduction:
            "Bekerja di frontend, backend, dan DevOps sambil membimbing tim engineering dan mengganti managed platform yang biayanya terus meningkat.",
          metrics: [
            { value: "$700+ → <$100", label: "biaya infrastruktur bulanan" },
            { value: "10 → 5 menit", label: "waktu deployment" },
          ],
          description:
            "Memindahkan platform ke Docker, Caddy, Portainer, dan DigitalOcean Droplet; menambahkan CI/CD otomatis; serta membuat fondasi monorepo yang dapat digunakan ulang dengan panduan pengembangan bersama.",
          tags: ["Full stack", "DevOps", "Monorepo", "Mentoring"],
        },
        {
          company: "DesignFiles.co",
          role: "Konsultan Frontend Engineer",
          period: "Jun 2021 - Des 2022",
          title:
            "Menghadirkan pengalaman produk modern di atas stack Rails yang matang.",
          introduction:
            "Bekerja sebagai satu-satunya konsultan frontend di dalam codebase Rails yang matang, menggunakan template Ruby, Sass, Gulp, dan vanilla JavaScript tanpa mengandalkan penulisan ulang dengan framework baru.",
          metrics: [],
          description:
            "Membuat aplikasi utama responsif di mobile dan desktop serta membangun pengalaman tutorial video interaktif, menghadirkan UX modern dalam batasan stack legacy yang telah teruji.",
          tags: [
            "Template Ruby",
            "Sass",
            "Gulp",
            "Vanilla JavaScript",
            "Modernisasi legacy",
          ],
        },
      ],
    },
    career: {
      eyebrow: "Karier",
      title: "Satu dekade bersama produk, platform, dan tim.",
      introduction:
        "Peran terbaru ditampilkan lebih rinci; pekerjaan sebelumnya menunjukkan perjalanan dari mobile SDK hingga leadership teknis.",
      earlierLabel: "Pengalaman sebelumnya",
      items: [
        {
          company: "Xenith",
          role: "Lead Frontend Engineer / Full-stack Engineer",
          period: "Mei 2024 - Sekarang",
          description:
            "Pembayaran lintas negara, design system, monorepo frontend, BFF API Node.js, dan delivery frontend di AWS.",
        },
        {
          company: "Fungsi",
          role: "Founder / Independent AI Engineer",
          period: "Nov 2025 - Mei 2026",
          description:
            "Lab independen untuk coding agent, AI gateway, deployment aplikasi, dan infrastruktur berbiaya rendah.",
        },
        {
          company: "Gojek / Midtrans",
          role: "Senior Frontend Engineer",
          period: "Apr 2022 - Jun 2023",
          description:
            "Modernisasi produk pembayaran dan migrasi frontend bertahap.",
        },
        {
          company: "Shopee Games",
          role: "Expert Software Engineer / Team Lead",
          period: "Apr 2020 - Jan 2022",
          description:
            "Sistem game berskala tinggi, delivery regional, performa, dan leadership tim.",
        },
      ],
      earlier:
        "Pekerjaan sebelumnya mencakup platform properti, produk commerce React Native, dan aplikasi live-streaming dengan modul beauty filter native untuk iOS.",
    },
    writing: {
      eyebrow: "Tulisan",
      title: "Catatan dari meja kerja.",
      introduction:
        "Eksperimen, sistem, dan pelajaran yang menjadi lebih jelas setelah dituliskan.",
      viewAll: "Lihat semua tulisan",
      empty: "Esai baru sedang disusun. Arsipnya akan hadir di sini.",
    },
    contact: {
      eyebrow: "Mulai percakapan",
      title: "Sedang membangun produk yang perlu berkembang?",
      description:
        "Saya terbuka untuk peran lead engineering dan proyek konsultasi pilihan di frontend, backend, fondasi platform, dan delivery.",
      action: "Kirim email",
      emailLabel: "Atau kirim email langsung",
      copyEmail: "Salin alamat email",
      copied: "Email tersalin",
    },
  },
} as const satisfies Record<Locale, object>;
