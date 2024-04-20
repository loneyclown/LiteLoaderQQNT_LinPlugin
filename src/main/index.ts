import { BrowserWindow, ipcMain, session, webContents } from "electron";
import _ from "lodash";
import config, { ConfigKey } from "../common/config";
import log from "../common/log";

// console.log("[LinPlugin info] >>> 插件加载成功");
log.logger.info("[LinPlugin info] >>> 插件加载成功");

// const linUidMap = new Map();
/** 全局数据 */
let globalData: GlobalData = {
	selfUin: null,
	yunguo: {
		zhandouNum: 0,
	},
};

const onLoad = (window: BrowserWindow) => {};

// 创建窗口时触发
exports.onBrowserWindowCreated = (window: BrowserWindow) => {
	// console.log("window.webContents.id", window.webContents.id);
	// if (window.webContents.id === 3) {
	// 	onLoad(window);
	// }
	// console.log("window", window);
	// console.log("webContents", window.webContents);
	// console.log("_events", (window.webContents as any)._events);
	// mainWindow = window;
};

ipcMain.on("IPC_UP_2", (event, ...args) => {
	const [evInfo, info] = args;
	const [, srcContent] = info;
	const { eventName } = evInfo;
	if (eventName === "ns-LoggerApi-2") {
		const regex =
			/^\[\d+\]\[Render\]\[MainWindow\]\[AuthStore\] initStore addExtraParameter: account_id (\d+)$/;
		const match = srcContent.match(regex);
		const selfUin = match?.[1];
		if (selfUin) {
			log.info("更新了selfUin", selfUin);
			globalData.selfUin = selfUin;
		}
	}
});

ipcMain.on("getGlobalData", (event) => {
	event.returnValue = globalData;
});
ipcMain.on("setGlobalData", (event, data) => {
	globalData = data;
});

ipcMain.on("get-config", (event, key: ConfigKey) => {
	// mainEvent = event;
	event.returnValue = config.getConfig(key);
});
ipcMain.handle("set-config", async (event, key: ConfigKey, value: any) => {
	await config.setConfig(key, value);
});

ipcMain.on("lin-plugin:log", (event, tag, data, type = "info") => {
	try {
		console.log({ tag, data, type });
		log[type](tag, data);
	} catch (error) {
		console.log("渲染层日志错误", error.toString());
		log.error("渲染层日志错误", error);
	}
});
