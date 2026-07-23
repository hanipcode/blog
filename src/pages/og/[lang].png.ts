import type { APIRoute, GetStaticPaths } from "astro";
import { profileByLocale } from "@data/profile";
import { generateOgImage } from "@lib/og";
import { locales, type Locale } from "@lib/i18n";

export const getStaticPaths = (() =>
  locales.map((lang) => ({
    params: { lang },
    props: { lang },
  }))) satisfies GetStaticPaths;

export const GET: APIRoute<{ lang: Locale }> = async ({ props }) => {
  const profile = profileByLocale[props.lang];
  const image = await generateOgImage({
    title: profile.hero.headline,
    description: profile.hero.introduction,
    eyebrow: profile.hero.eyebrow,
    tags:
      props.lang === "en"
        ? ["Frontend", "Backend", "Leadership"]
        : ["Frontend", "Backend", "Leadership"],
    variant: "home",
  });

  return new Response(new Uint8Array(image), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
