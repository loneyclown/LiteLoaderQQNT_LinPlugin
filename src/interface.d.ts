import { CONFIG_KEY, ConfigType } from "./common/config";

export interface ILinPluginAPI {
	log: (...msg: any[]) => void;
	pluginLog: (tag: string, data: any, type?: "info" | "error") => void;

	getConfigAll: () => ConfigType;
	getConfig: (key: CONFIG_KEY) => any;
	setConfig: (key: CONFIG_KEY, value: any) => Promise<void>;

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
		// yunguo: {
		// 	/** 战斗次数 */
		// 	zhandouNum?: number;
		// 	/** 当前跟车指令缓存 */
		// 	genCheCmdTemp?: string;
		// 	/** 当前是否在车上(发车员) */
		// 	isInChe?: boolean;
		// 	/** 当前是否在发车cd中(发车员) */
		// 	isFaCheCD?: boolean;
		// };
	}
}
