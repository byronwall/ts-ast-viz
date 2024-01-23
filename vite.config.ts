import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), nodePolyfills()],
  base: "/",
  define: {
    "process.env": {},
  },
});
