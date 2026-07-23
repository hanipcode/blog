import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import { getPostSlug, isVisiblePost } from "@lib/i18n";
import { generateOgImage } from "@lib/og";

interface Props {
  post: CollectionEntry<"posts">;
}

export const getStaticPaths = (async () => {
  const posts = (await getCollection("posts")).filter(isVisiblePost);

  return posts.map((post) => ({
    params: { lang: post.data.locale, slug: getPostSlug(post) },
    props: { post },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<Props> = async ({ props }) => {
  const { post } = props;
  const image = await generateOgImage({
    title: post.data.title,
    description: post.data.description,
    eyebrow: post.data.locale === "en" ? "Writing" : "Tulisan",
    tags: post.data.tags,
    variant: "post",
  });

  return new Response(new Uint8Array(image), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
