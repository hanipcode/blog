import type { CollectionEntry } from "astro:content";

export const locales = ["en", "id"] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  id: "Bahasa Indonesia",
};

export const copy = {
  en: {
    blog: "Writing",
    description: "Notes on software, system, and the people that build them.",
    home: "Home",
    read: "Read article",
    switchLanguage: "Read in Indonesian",
    theme: "Change color theme",
    switchToLight: "Switch to light mode",
    switchToDark: "Switch to dark mode",
    work: "Work",
    consulting: "Consulting",
    experience: "Career",
    contact: "Let's talk",
    menu: "Menu",
    primaryNavigation: "Primary navigation",
    language: "Language",
    skip: "Skip to content",
    footer: "Software, systems, and notes from the workbench.",
    newTab: "opens in a new tab",
  },
  id: {
    blog: "Tulisan",
    description:
      "Catatan soal software, sistem, dan detail-detail di antaranya.",
    home: "Beranda",
    read: "Baca tulisan",
    switchLanguage: "Baca dalam bahasa Inggris",
    theme: "Ganti tema warna",
    switchToLight: "Gunakan mode terang",
    switchToDark: "Gunakan mode gelap",
    work: "Karya",
    consulting: "Konsultasi",
    experience: "Karier",
    contact: "Mari bicara",
    menu: "Menu",
    primaryNavigation: "Navigasi utama",
    language: "Bahasa",
    skip: "Lewati ke konten",
    footer: "Software, sistem, dan catatan dari meja kerja.",
    newTab: "dibuka di tab baru",
  },
} as const;

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

export function getPostSlug(post: CollectionEntry<"posts">): string {
  const withoutLocale = post.id.replace(
    new RegExp(`^${post.data.locale}/`),
    "",
  );
  return withoutLocale.replace(/\/index$/, "").replace(/\.(md|mdx)$/, "");
}

export function postUrl(post: CollectionEntry<"posts">): string {
  return `/${post.data.locale}/blog/${getPostSlug(post)}/`;
}

export function isVisiblePost(post: CollectionEntry<"posts">): boolean {
  return !post.data.draft && (!post.data.devOnly || import.meta.env.DEV);
}

export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    dateStyle: "long",
  }).format(date);
}
