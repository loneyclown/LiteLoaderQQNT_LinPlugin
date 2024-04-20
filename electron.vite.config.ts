import cp from "vite-plugin-cp";
import { defineConfig, defineViteConfig } from "electron-vite";

// let config = {
// 	main: {
// 		build: {
// 			outDir: "dist/main",
// 			emptyOutDir: true,
// 			lib: {
// 				formats: ["cjs"],
// 				entry: { main: "src/main/index.ts" },
// 			},
// 			rollupOptions: {
// 				input: "src/main/index.ts",
// 			},
// 		},
// 		plugins: [
// 			cp({
// 				targets: [
// 					{ src: "./manifest.json", dest: "dist" },
// 					{
// 						src: "./src/renderer/static/view.html",
// 						dest: "dist/static",
// 					},
// 					{
// 						src: "./src/renderer/static/view.css",
// 						dest: "dist/static",
// 					},
// 				],
// 			}),
// 		],
// 	},
// 	preload: {
// 		build: {
// 			outDir: "dist/preload",
// 			emptyOutDir: true,
// 			lib: {
// 				formats: ["cjs"],
// 				entry: { preload: "src/preload.ts" },
// 			},
// 			rollupOptions: {
// 				input: "src/preload.ts",
// 			},
// 		},
// 		resolve: {},
// 	},
// 	renderer: {
// 		build: {
// 			outDir: "dist/renderer",
// 			emptyOutDir: true,
// 			lib: {
// 				formats: ["es"],
// 				entry: { renderer: "src/renderer/index.ts" },
// 			},
// 			rollupOptions: {
// 				input: "src/renderer/index.ts",
// 			},
// 		},
// 	},
// };

// export default config;

export default defineConfig({
	main: defineViteConfig({
		build: {
			outDir: "dist/main",
			emptyOutDir: true,
		},
		plugins: [
			cp({
				targets: [
					{ src: "./manifest.json", dest: "dist" },
					{
						src: "./src/renderer/static/view.html",
						dest: "dist/static",
					},
					{
						src: "./src/renderer/static/view.css",
						dest: "dist/static",
					},
				],
			}),
		],
	}),
	preload: defineViteConfig({
		build: {
			outDir: "dist/preload",
			emptyOutDir: true,
			lib: {
				entry: { preload: "src/preload.ts" },
			},
		},
	}),
	renderer: defineViteConfig({
		build: {
			outDir: "dist/renderer",
			emptyOutDir: true,
			lib: {
				formats: ["es"],
				entry: { renderer: "src/renderer/index.ts" },
			},
			rollupOptions: {
				input: "src/renderer/index.ts",
				output: {
					dir: "dist/renderer",
					// 将其他配置项合并
					...(() => {
						if (process.env.NODE_ENV === "production") {
							return {
								manualChunks(id) {
									if (id.includes("/src/renderer/lib/")) {
										return "ignored"; // 忽略这些文件夹
									}
								},
							};
						}
						return {};
					})(),
					// exclude: 'src/renderer/lib/**/*',
				},
			},
		},
	}),
});
