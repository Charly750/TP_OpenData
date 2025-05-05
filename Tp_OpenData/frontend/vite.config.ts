import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
	plugins: [react(), tailwindcss(), nodePolyfills()],
	define: {
		"process.env": {},
	},
	resolve: {
		alias: {
			process: "process/browser",
		},
	},
});
