import { MessageChain } from "../lib/euphony/src";
import BaseEvent from "./baseEvent";
import Message from "./message";

const linPluginAPI = window.linPluginAPI;
const pluginLog = linPluginAPI.pluginLog;

class WuxiaEvent extends BaseEvent {
	constructor(message: Message) {
		super(message);
	}

	private get textElementContent() {
		const e1 = this.message.elements.filter((e) => e.elementType === 1);
		const { textElement = { content: "" } } = e1?.[0] || {};
		return textElement?.content || "";
	}

	// private decodeGBK(buffer: ArrayBuffer) {
	// 	// GBK编码字节的处理
	// 	let str = "";
	//   const bufferLength = buffer as Uint32;
	// 	for (let i = 0; i < bufferLength; i++) {
	// 		if (buffer[i] <= 127) {
	// 			str += String.fromCharCode(buffer[i]);
	// 		} else {
	// 			str += "%" + buffer[i].toString(16).toUpperCase();
	// 		}
	// 	}
	// 	return decodeURIComponent(str);
	// }

	onRecvActiveMsg() {
		this.onAnnouncement();
		// pluginLog("测试Wuxia", this.message.qqMsg);
	}

	async onAnnouncement() {
		if (/^lin天刀公告(体服)?(最新)?/.test(this.textElementContent)) {
			const tfFlag = this.textElementContent.includes("体服");
			const newFlag = this.textElementContent.includes("最新");
			const url =
				"https://wuxia.qq.com/webplat/info/news_version3/5012/5013/5014/5016/m3485/list_1.shtml";
			try {
				const text = await fetch(url)
					.then((response: Response) => response.arrayBuffer())
					.then((buffer) => new TextDecoder("gbk").decode(buffer));
				const liReg = /<li class="news-st"(([\s\S])*?)<\/li>/gi;
				const iterator = text.matchAll(liReg);
				const arr = [];
				for (const item of iterator) {
					if (item && item[0]) {
						const liStr = item[0];
						const url = liStr.match(
							/<a class="cltit" (.*) href=\"(.*)\">(.*)<\/a>/
						)[2];
						const text = liStr.match(
							/<a class="cltit" (.*) href=\"(.*)\">(.*)<\/a>/
						)[3];
						const date = liStr.match(/<span class="cltime">(.*)<\/span>/)[1];

						if (tfFlag) {
							if (text.includes("欢乐英雄")) {
								arr.push({
									liStr,
									text,
									date,
									url: `https://wuxia.qq.com${url}`,
								});
							}
						} else {
							arr.push({
								liStr,
								text,
								date,
								url: `https://wuxia.qq.com${url}`,
							});
						}
					}
				}
				// console.log(arr);
				const messageChain = new MessageChain();
			} catch (error) {
				pluginLog("请求错误:", error, "error");
			}
			// const req = http.request(options, (res) => {
			// 	const chunks = [];
			// 	res.on("data", (chunk) => {
			// 		chunks.push(chunk);
			// 	});
			// 	res.on("end", () => {
			// 		const buffer = Buffer.concat(chunks);
			// 		const html = this.decodeGBK(buffer);
			// 		pluginLog("GBK编码的HTML内容:", html);
			// 	});
			// });

			// req.on("error", (error) => {
			// 	pluginLog("请求错误:", error, "error");
			// });

			// req.end();
		}
	}
}

export default WuxiaEvent;
