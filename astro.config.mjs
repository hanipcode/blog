import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import { unified } from "@astrojs/markdown-remark";
import { defineConfig } from "astro/config";
import remarkMermaid from "./src/plugins/remark-mermaid.mjs";

export default defineConfig({
  site: "https://hanip.dev",
  integrations: [mdx(), react()],
  markdown: {
    processor: unified({ remarkPlugins: [remarkMermaid] }),
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      wrap: true,
    },
  },
  output: "static",
});
