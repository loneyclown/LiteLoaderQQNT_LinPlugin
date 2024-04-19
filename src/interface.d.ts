export interface ILinPluginAPI {
	startShuaJi: () => Promise<void>;
	setGlobalData: (data: GlobalData) => void;
	getGlobalData: () => GlobalData;
	getLinUid: (uin: string) => string;
	setLinUid: (uin: string, uid: string) => void;
	// linUidSet: (uin: string, uid: string) => void;
	// linUidGet: (uin: string) => string;
}

declare global {
	interface Window {
		linPluginAPI: ILinPluginAPI;
		euphony: any;
	}
	interface GlobalData {
		linUid: { [key: string]: string };
	}
}
