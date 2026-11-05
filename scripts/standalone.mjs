import fs from "node:fs/promises";
import path from "node:path";
const root = path.resolve("dist");
const html = await fs.readFile(path.join(root, "index.html"), "utf8");
const js = html.match(/<script[^>]*src="([^"]+)"[^>]*><\/script>/)?.[1];
const css = html.match(/<link[^>]*href="([^"]+\.css)"[^>]*>/)?.[1];
if (!js || !css) throw new Error("Built assets not found");
const source = await fs.readFile(
  path.join(root, js.replace(/^\//, "")),
  "utf8",
);
const styles = await fs.readFile(
  path.join(root, css.replace(/^\//, "")),
  "utf8",
);
const output = html
  .replace(
    /<script[^>]*src="[^"]+"[^>]*><\/script>/,
    () =>
      `<script type="module">${source.replace(/<\/script/gi, "<\\/script")}</script>`,
  )
  .replace(
    /<link[^>]*href="[^"]+\.css"[^>]*>/,
    () => `<style>${styles}</style>`,
  )
  .replace(/<link[^>]*rel="icon"[^>]*>/, "");
await fs.writeFile("PLAYGROUND.html", output);
console.log("Created PLAYGROUND.html: self-contained, no network needed");
