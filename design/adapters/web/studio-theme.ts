// Made by Universal App Studio. Reads design/tokens.json and turns it into CSS variables and a
// Google Fonts link, for any web stack (Next.js, Vite, Astro, SvelteKit, Nuxt, Tauri, Electron,
// browser extensions and web games). Change the look in Studio (it rewrites design/tokens.json),
// never here: this file holds no colours of its own, so it never goes out of date.
import tokens from "../../tokens.json";

type Tokens = {
  name?: string;
  color: Record<string, string>;
  font: { display: string; body: string };
  radius: Record<string, string>;
  space: number[];
  layout?: { maxWidth?: string };
};
const t = tokens as unknown as Tokens;

export const projectName = t.name || "New project";
export const colors = t.color;
export const fonts = t.font;
export const radius = t.radius;
export const space = t.space;

/** Every token as a CSS variable: --studio-bg, --studio-primary, --studio-font-body, --studio-radius-md, --studio-space-3 and so on. */
export const cssVariables: Record<string, string> = {
  ...Object.fromEntries(Object.entries(t.color).map(([k, v]) => [`--studio-${k}`, v])),
  "--studio-font-display": `'${t.font.display}', Georgia, serif`,
  "--studio-font-body": `'${t.font.body}', system-ui, sans-serif`,
  ...Object.fromEntries(Object.entries(t.radius).map(([k, v]) => [`--studio-radius-${k}`, v])),
  ...Object.fromEntries(t.space.map((v, i) => [`--studio-space-${i + 1}`, `${v}px`])),
  "--studio-max-width": t.layout?.maxWidth || "1200px",
};

/** The variables as one CSS rule, ready for a <style> tag in the root layout. */
export const themeCss = `:root{${Object.entries(cssVariables).map(([k, v]) => `${k}:${v}`).join(";")}}`;

/** The Google Fonts stylesheet for the two fonts. */
export const fontsHref = `https://fonts.googleapis.com/css2?${[...new Set([t.font.display, t.font.body])]
  .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}:wght@400;600;700`).join("&")}&display=swap`;

/** "#2f6b55" becomes 0x2f6b55, the number form canvas and game libraries (such as Phaser) expect. */
export function colorNumber(hex: string): number {
  return parseInt(hex.replace("#", ""), 16);
}

/** For apps without a server-rendered layout (Vite, Tauri, Electron, extensions): adds the variables and fonts to the page once. */
export function applyTheme(doc: Document = document): void {
  if (doc.getElementById("studio-theme")) return;
  const style = doc.createElement("style");
  style.id = "studio-theme";
  style.textContent = themeCss;
  doc.head.appendChild(style);
  const link = doc.createElement("link");
  link.rel = "stylesheet";
  link.href = fontsHref;
  doc.head.appendChild(link);
}
