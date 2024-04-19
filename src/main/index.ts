import { BrowserWindow, ipcMain, session } from "electron";
import _ from "lodash";

console.log("LinPlugin 加载成功");

// const linUidMap = new Map();
/** 全局数据 */
let globalData: GlobalData = {
	linUid: {},
};

// 创建窗口时触发
exports.onBrowserWindowCreated = (window: BrowserWindow) => {
	

};

ipcMain.on("IPC_UP_2", (event, ...args) => {
	const [evInfo, info] = args;
	const [, srcContent] = info;
	// console.log("srcContent>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", srcContent);
	try {
		if (
			srcContent &&
			_.isString(srcContent) &&
			_.includes(srcContent, "handleRecentContactListChanged")
		) {
			// console.log("srcContent>>>>>>", srcContent);
			try {
				const regex =
					/^(.+)handleRecentContactListChanged\: baseInfo=(.+)changeListSize=\d+ changeList\[\d+\] (.+)/;
				const matchJson = srcContent.match(regex);
				const m3json = JSON.parse(matchJson[2]);
				const m4json = JSON.parse(matchJson[3]);
				const { abstractContent, senderUin, senderUid } = m4json;
				if (senderUin === "2854200865") {
					/** 缓存于全局数据中的uid */
					const sesUid = globalData.linUid?.[senderUin] || null;
					if (!sesUid || (sesUid && sesUid !== senderUid)) {
						console.log("检测到草王新的uid >>>", senderUid);
						globalData.linUid[senderUin] = senderUid;
					}
				}
			} catch (error) {
				console.log("正则匹配解析错误", error.toString());
			}
		}
	} catch (error) {
		console.log("IPC_UP_2 解析错误", error.toString());
	}
});

ipcMain.on("getGlobalData", (event) => {
	// 将数据发送给渲染进程
	event.returnValue = globalData;
});

ipcMain.on("setGlobalData", (event, data) => {
	// 更新全局数据
	globalData = data;
});