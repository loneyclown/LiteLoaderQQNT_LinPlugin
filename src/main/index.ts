import { BrowserWindow, ipcMain, session, webContents } from "electron";
import _ from "lodash";
import config, { CONFIG_KEY } from "../common/config";
import log from "../common/log";

// console.log("[LinPlugin info] >>> 插件加载成功");
log.logger.info("[LinPlugin info] >>> 插件加载成功");

// const linUidMap = new Map();
/** 全局数据 */
export let globalData: GlobalData = {
	selfUin: null,
	yunguo: {
		zhandouNum: 0,
	},
};

// 创建窗口时触发
exports.onBrowserWindowCreated = (window: BrowserWindow) => {};

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
			globalData.selfUin = selfUin;
			config.init(selfUin);
		}
	}
});

ipcMain.on("getGlobalData", (event) => {
	event.returnValue = globalData;
});
ipcMain.on("setGlobalData", (event, data) => {
	globalData = data;
});

ipcMain.on("get-config", (event, key: CONFIG_KEY) => {
	event.returnValue = config.getConfig(key);
});
ipcMain.on("get-config:all", (event, key: CONFIG_KEY) => {
	event.returnValue = config.config;
});
ipcMain.handle("set-config", async (event, key: CONFIG_KEY, value: any) => {
	await config.setConfig(key, value);
});

ipcMain.on("lin-plugin:log", (event, tag, data, type = "info") => {
	try {
		log[type](tag, data);
	} catch (error) {
		log.error("渲染层日志错误", error);
	}
});
