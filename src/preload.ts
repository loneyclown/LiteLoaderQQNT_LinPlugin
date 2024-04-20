import config, { ConfigKey } from "./common/config";

// Electron 主进程 与 渲染进程 互相交互的桥梁
const { contextBridge, ipcRenderer } = require("electron");

// 在渲染进程的全局对象上暴露对象
contextBridge.exposeInMainWorld("linPluginAPI", {
	log: (...msg) => ipcRenderer.send("LiteLoader.lite_tools.log", ...msg),
	pluginLog: (...msg) => ipcRenderer.send("lin-plugin:log", ...msg),

	getConfig: (key: ConfigKey) => ipcRenderer.sendSync("get-config", key),
	setConfig: async (key: ConfigKey, value: any) => {
		return await ipcRenderer.invoke("set-config", key, value);
	},

	setGlobalData: (data) => {
		ipcRenderer.send("setGlobalData", data);
	},
	getGlobalData: () => {
		return ipcRenderer.sendSync("getGlobalData");
	},
});
