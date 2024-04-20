import { ConfigKey } from "./common/config";

export interface ILinPluginAPI {
	log: (...msg: any[]) => void;
	pluginLog: (tag: string, data: any, type?: "info" | "error") => void;

	getConfig: (key: ConfigKey) => any;
	setConfig: (key: ConfigKey, value: any) => Promise<void>;

	setGlobalData: (data: GlobalData) => void;
	getGlobalData: () => GlobalData;
}

declare global {
	interface globalThis {
		LiteLoader: {
			plugins: {
				slug: any;
			};
			api: {
				config: {
					set(slug, new_config): void;
					get(slug, default_config?): any;
				};
			};
		};
	}
	interface Window {
		linPluginAPI: ILinPluginAPI;
		euphonyNative: any;
	}
	interface GlobalData {
		selfUin: number | null;
		yunguo: {
			/** 战斗次数 */
			zhandouNum: number;
		};
	}
}
