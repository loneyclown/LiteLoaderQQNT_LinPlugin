import cp from "vite-plugin-cp";

let config = {
	main: {
		build: {
			outDir: "dist/main",
			emptyOutDir: true,
			lib: {
				formats: ["cjs"],
				entry: { main: "src/main/index.ts" },
			},
			rollupOptions: {
				input: "src/main/index.ts",
			},
		},
		plugins: [
			cp({
				targets: [
					// ...external.map(genCpModule),
					{ src: "./manifest.json", dest: "dist" },
				],
			}),
		],
	},
	preload: {
		build: {
			outDir: "dist/preload",
			emptyOutDir: true,
			lib: {
				formats: ["cjs"],
				entry: { preload: "src/preload.ts" },
			},
			rollupOptions: {
				input: "src/preload.ts",
			},
		},
		resolve: {},
	},
	renderer: {
		build: {
			outDir: "dist/renderer",
			emptyOutDir: true,
			lib: {
				formats: ["es"],
				entry: { renderer: "src/renderer/index.ts" },
			},
			rollupOptions: {
				input: "src/renderer/index.ts",
			},
		},
	},
};

export default config;
