import { sleep } from "../../common/utils";
import { At, Group } from "../lib/euphony/src";
import BaseEvent from "./baseEvent";
import Message from "./message";

const linPluginAPI = window.linPluginAPI;
const pluginLog = linPluginAPI.pluginLog;

class Yunguo extends BaseEvent {
	#shuajiGroupId: string;
	#shuajiGroup: Group;
	#at: At;
	#globalData: GlobalData;
	constructor(message: Message) {
		super(message);
		this.#shuajiGroupId = linPluginAPI.getConfig("shuajiGroupId");
		this.#shuajiGroup = new Group(this.#shuajiGroupId);
		this.#at = new At(this.message.senderUin, this.message.senderUid);
		this.#globalData = linPluginAPI.getGlobalData();
	}

	onRecvActiveMsg() {
		// 只接受草神消息
		if (this.message.senderUin === "2854200865") {
			if (this.message.peerUin === this.#shuajiGroupId) {
				this.onShuaji();
			}
		}
	}

	private getYouLiUid() {
		const e14 = this.message.elements.filter((e) => e.elementType === 14);
		const { markdownElement } = e14[0];
		const reg = /用户:(\d+) \[\s+送花/;
		const match = markdownElement.content.match(reg);
		const [, uid] = match;
		return uid;
	}

	private set yunGuoData(data: GlobalData["yunguo"]) {
		linPluginAPI.setGlobalData({ ...this.#globalData, yunguo: data });
	}

	private get yunGuoData() {
		const yunGuoData = linPluginAPI.getGlobalData().yunguo;
		return yunGuoData;
	}

	private get markdownElementContent() {
		const e14 = this.message.elements.filter((e) => e.elementType === 14);
		const { markdownElement } = e14?.[0];
		return markdownElement?.content;
	}

	async onShuaji() {
		// pluginLog(`this.message.qqMsg`, this.message.qqMsg);
		// pluginLog("this.#globalData", this.#globalData);
		// const uid = this.getYouLiUid();
		// const yunguoUid = linPluginAPI.getConfig("yunguoUid");
		const shuajiFlag = linPluginAPI.getConfig("shuajiFlag");
		/** 草神bot 是否艾特的是当前用户 */
		const isAtSelf = this.markdownElementContent.includes(
			`at_tinyid=${this.#globalData.selfUin}`
		);

		if (isAtSelf && shuajiFlag) {
			/** 当前消息是简单游历回执 */
			const youliFlag =
				this.markdownElementContent.includes("本次游历平平无奇");
			/** 当前消息是云国战斗回执 */
			const zhandouFlag = !!this.message.findButton("确定战斗");
			/** 当前消息是确定战斗回执 */
			const zhandouConfirmFlag =
				this.markdownElementContent.includes("你击败了") &&
				this.markdownElementContent.includes("点经验升级下一等级");
			/** 是否进入战斗cd */
			const zhandouCdFalg =
				this.markdownElementContent.includes("距离下一次战斗");

			pluginLog("测试忠诚", {
				youliFlag,
				zhandouFlag,
				zhandouConfirmFlag,
				zhandouCdFalg,
			});

			if (youliFlag) {
				await sleep(1000);
				this.sendGroupMessage(this.#shuajiGroup, " 云国战斗", this.#at);
			}
			if (zhandouFlag) {
				await sleep(1000);
				this.sendGroupMessage(this.#shuajiGroup, " 确定战斗", this.#at);
			}
			if (zhandouConfirmFlag) {
				await sleep(1000);
				this.sendGroupMessage(this.#shuajiGroup, " 云国战斗", this.#at);
			}
			if (zhandouCdFalg) {
				await sleep(75000);
				this.sendGroupMessage(this.#shuajiGroup, " 简单游历", this.#at);
			}
		}
	}
}

export default Yunguo;
