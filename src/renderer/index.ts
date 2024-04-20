// import fs from "fs";
// @ts-ignore
// import StyleRaw from "./style.css?raw";
import config from "../common/config";
import BaseEvent from "./event/baseEvent";
import Message, { NtQQMsg } from "./event/message";
import Yunguo from "./event/yunguo";

const linPluginAPI = window.linPluginAPI;
const pluginLog = linPluginAPI.pluginLog;
// import { EventChannel, Group } from "./lib/LiteLoaderQQNT-Euphony/src";
// import log from "../common/log";

// const sleep = (time: number) =>
// 	new Promise((resolve) => setTimeout(resolve, time));

// const sendMessage = async (
// 	message: string,
// 	groupId: string = "724297426",
// 	option: { isAtCw?: boolean } = {}
// ) => {
// 	const { isAtCw = true } = option;
// 	const group = new window.euphony.Group(groupId);
// 	return new Promise((resolve, reject) => {
// 		if (isAtCw) {
// 			const cwUid = window.linPluginAPI.getLinUid("2854200865") ?? null;
// 			if (!cwUid) {
// 				alert("未检测到草王UID");
// 				reject();
// 			}
// 			const at = new window.euphony.At("2854200865", cwUid);
// 			const messageChain = new window.euphony.MessageChain();
// 			messageChain.append(at).append(new window.euphony.PlainText(message));
// 			group.sendMessage(messageChain);
// 			resolve(null);
// 		}
// 	});
// };

// const eventChannel = EventChannel.fromNative();

// 打开设置界面触发
export const onSettingWindowCreated = async (view: Element) => {
	try {
		const pluginPath = globalThis.LiteLoader.plugins.LinPlugin.path.plugin;
		const style = document.createElement("link");
		style.rel = "stylesheet";
		style.type = "text/css";
		style.href = `local:///${pluginPath}/static/view.css`;
		document.head.append(style);
		const localHtmlPath = `local:///${pluginPath}/static/view.html`;
		const html = await fetch(localHtmlPath);
		const htmlText = await html.text();
		view.insertAdjacentHTML("afterbegin", htmlText);

		const setInputValue = (id: string, value: string) => {
			const input = view.querySelector(id) as HTMLInputElement;
			input.value = value;
		};

		const getInputValue = (id: string) => {
			const input = view.querySelector(id) as HTMLInputElement;
			return input.value;
		};

		// 读取配置中的云国UID并赋值给input
		setInputValue("#yunguoUid", window.linPluginAPI.getConfig("yunguoUid"));
		// 读取配置中的刷级群并赋值给input
		setInputValue(
			"#shuaJiGroupId",
			window.linPluginAPI.getConfig("shuajiGroupId")
		);

		view
			.querySelector(".yunguo-uid setting-button")
			.addEventListener("click", async () => {
				const yunguoUid = getInputValue("#yunguoUid");
				await window.linPluginAPI.setConfig("yunguoUid", yunguoUid);
			});

		/** 刷机开关 */
		const functionYunGuoShuajiSwitch = view.querySelector(
			".function .yunguo-shuaji setting-switch"
		);
		functionYunGuoShuajiSwitch.toggleAttribute(
			"is-active",
			window.linPluginAPI.getConfig("shuajiFlag")
		);
		// const functionYunGuoPugongSwitch = view.querySelector(
		// 	".function .yunguo-pugong setting-switch"
		// );
		functionYunGuoShuajiSwitch.addEventListener("click", async () => {
			const isActive = functionYunGuoShuajiSwitch.hasAttribute("is-active");
			const groupId = getInputValue("#shuaJiGroupId");
			if (!isActive) {
				await window.linPluginAPI.setConfig("shuajiFlag", true);
				await window.linPluginAPI.setConfig("shuajiGroupId", groupId);
			} else {
				window.linPluginAPI.setConfig("shuajiFlag", false);
			}
			functionYunGuoShuajiSwitch.toggleAttribute("is-active", !isActive);
		});

		// functionYunGuoPugongSwitch.addEventListener("click", () => {
		// 	const isActive = functionYunGuoPugongSwitch.hasAttribute("is-active");
		// 	alert(`isActive-${isActive}`);
		// 	console.log("isActive", isActive);
		// 	const groupId = (view.querySelector("#puGongGroupId") as HTMLInputElement)
		// 		.value;
		// 	if (!isActive) {
		// 		puGongFlag = true;
		// 		puGongLoop(groupId);
		// 	} else {
		// 		puGongFlag = false;
		// 	}
		// 	functionYunGuoPugongSwitch.toggleAttribute("is-active", !isActive);
		// });
	} catch (error) {
		// log.logger.error("渲染层出错", error);
		alert(`渲染层出错-${error.toString()}`);
		console.error("渲染层出错", error);
	}
};

const init = async () => {
	// eventChannel.subscribeEvent(
	// 	"receive-message",
	// 	(messageChain: MessageChain) => {
	// 		try {
	// 			const ele = messageChain.toElements();
	// 			// console.log("payload", payload);
	// 			window.linPluginAPI.pluginLog("ele", ele);
	// 			// window.linPluginAPI.pluginLog("payload.msgList", payload.msgList);
	// 		} catch (error) {
	// 			window.linPluginAPI.pluginLog(
	// 				"receive-message监听错误",
	// 				error,
	// 				"error"
	// 			);
	// 		}
	// 	}
	// );
	window.euphonyNative.subscribeEvent(
		"nodeIKernelMsgListener/onRecvActiveMsg",
		({ msgList }: { msgList: NtQQMsg[] }) => {
			try {
				const message = new Message(msgList);
				// pluginLog("NtQQMessage", message.message);
				const yunguo = new Yunguo(message);
				yunguo.onRecvActiveMsg();
			} catch (error) {
				window.linPluginAPI.pluginLog(
					"onRecvActiveMsg监听错误",
					error,
					"error"
				);
			}
		}
	);
};

init();
