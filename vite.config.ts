// vite.config.ts — bb-web-shell (a normal app).
//   npm run dev     -> http://localhost:4000
//   npm run build   -> dist/
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const reactPlugin = react();
const tailwindPlugin = tailwindcss();

export default defineConfig({
  // dff-util expects Node's "global" object.
  define: { global: "globalThis" },
  plugins: [reactPlugin, tailwindPlugin],
});
