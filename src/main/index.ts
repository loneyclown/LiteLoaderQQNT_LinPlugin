import { BrowserWindow, ipcMain } from "electron";
import _ from "lodash";
import config, { CONFIG_KEY } from "../common/config";
import log from "../common/log";

log.logger.info("[LinPlugin info] >>> 插件加载成功");

/** 全局数据 */
export let globalData: GlobalData = {
	selfUin: null,
	selfUid: null,
	selfInfo: null,
};

// 创建窗口时触发
exports.onBrowserWindowCreated = (window: BrowserWindow) => {};

ipcMain.on("IPC_UP_2", (event, ...args) => {
	const [evInfo, info] = args;
	const [, srcContent] = info;
	const { eventName } = evInfo;
	if (eventName === "ns-LoggerApi-2") {
		const regex =
			/^\[\d+\]\[Render\]\[MainWindow\]\[AuthStore\] initStore ({.*})/;
		const match = srcContent.match(regex);
		if (match) {
			try {
				const json = JSON.parse(match?.[1]);
				globalData.selfInfo = json;
				globalData.selfUin = json?.uin;
				globalData.selfUid = json?.uid;
				console.log(">>> 账户信息获取成功 >>>", json);
				config.init(globalData.selfUin);
			} catch (error) {
				log.error("账户信息获取失败", error);
			}
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
ipcMain.on("get-config:all", (event) => {
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
