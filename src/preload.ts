// Electron 主进程 与 渲染进程 互相交互的桥梁
const { contextBridge, ipcRenderer } = require("electron");

// 在渲染进程的全局对象上暴露对象
contextBridge.exposeInMainWorld("linPluginAPI", {
	startShuaJi: () => ipcRenderer.invoke("start:shuaji"),
	setGlobalData: (data) => {
		ipcRenderer.send("setGlobalData", data);
	},
	getGlobalData: () => {
		return ipcRenderer.sendSync("getGlobalData");
	},
	getLinUid: (uin: string) => {
		const globalData = ipcRenderer.sendSync("getGlobalData");
		return globalData.linUid[uin] || null;
	},
	setLinUid: (uin: string, uid: string) => {
		const globalData = ipcRenderer.sendSync("getGlobalData");
		if (uin && uid) {
			globalData.linUid = globalData.linUid ?? {}; // 初始化 linUid 对象
			globalData.linUid[uin] = uid;
			ipcRenderer.send("setGlobalData", globalData);
		}
	},
});
