import { sleep } from "../../common/utils";
import { At, Group } from "../lib/euphony/src";
import BaseEvent from "./baseEvent";
import Message from "./message";

const linPluginAPI = window.linPluginAPI;
const pluginLog = linPluginAPI.pluginLog;

class Yunguo extends BaseEvent {
	#shuajiGroupId: string;
	#shuajiGroup: Group;
	#pugongGroupId: string;
	#pugongGroup: Group;
	#at: At;
	#globalData: GlobalData;
	constructor(message: Message) {
		super(message);
		this.#shuajiGroupId = linPluginAPI.getConfig("shuajiGroupId");
		this.#shuajiGroup = new Group(this.#shuajiGroupId);
		this.#pugongGroupId = linPluginAPI.getConfig("puGongGroupId");
		this.#pugongGroup = new Group(this.#pugongGroupId);
		this.#at = new At(this.message.senderUin, this.message.senderUid);
		this.#globalData = linPluginAPI.getGlobalData();
	}

	onRecvActiveMsg() {
		// 只接受草神消息
		if (this.message.senderUin === "2854200865") {
			if (this.message.peerUin === this.#shuajiGroupId) {
				this.onShuaji();
			}
			if (this.message.peerUid === this.#pugongGroupId) {
				this.onBoss();
			}
		}
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

	/** 草神bot 是否艾特的是当前用户 */
	isAtSelf() {
		return this.markdownElementContent.includes(
			`at_tinyid=${this.#globalData.selfUin}`
		);
	}

	async onShuaji() {
		const shuajiFlag = linPluginAPI.getConfig("shuajiFlag");
		const shuajiAutoUpgradeFlag = linPluginAPI.getConfig(
			"shuajiAutoUpgradeFlag"
		);

		if (this.isAtSelf && shuajiFlag) {
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

			// pluginLog("测试忠诚", {
			// 	youliFlag,
			// 	zhandouFlag,
			// 	zhandouConfirmFlag,
			// 	zhandouCdFalg,
			// });

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
				if (shuajiAutoUpgradeFlag) {
					this.sendGroupMessage(this.#shuajiGroup, " 升级", this.#at);
				} else {
					this.sendGroupMessage(this.#shuajiGroup, " 简单游历", this.#at);
				}
			}
			if (this.markdownElementContent.includes("恭喜你已升级成功")) {
				if (shuajiAutoUpgradeFlag) {
					await sleep(1000);
					this.sendGroupMessage(this.#shuajiGroup, " 简单游历", this.#at);
				}
			}
		}
	}

	async onBoss() {
		const bossFlag = linPluginAPI.getConfig("bossFlag");

		if (this.isAtSelf && bossFlag) {
			// pluginLog("测试云国boss", this.message.qqMsg);
			const regex = /boss血量：(\d+)\r/;
			const match = this.markdownElementContent.match(regex);
			const bossHp = match?.[1];

			if (bossHp && this.markdownElementContent.includes("请决定下一步操作")) {
				await sleep(3000);
				this.sendGroupMessage(this.#pugongGroup, " 普攻", this.#at);
			}

			if (this.markdownElementContent.includes("无法继续战斗")) {
				const pugongAutoYaoFlag = linPluginAPI.getConfig("pugongAutoYaoFlag");
				if (pugongAutoYaoFlag) {
					const yaoshuiCmd = linPluginAPI.getConfig("yaoshuiCmd");
					await sleep(1000);
					this.sendGroupMessage(this.#pugongGroup, ` ${yaoshuiCmd}`, this.#at);
				} else {
					await sleep(3000);
					this.sendGroupMessage(this.#pugongGroup, " 普攻", this.#at);
				}
			}

			if (this.markdownElementContent.match(/你使用了(\d+)个圣水/)) {
				await sleep(3000);
				this.sendGroupMessage(this.#pugongGroup, " 普攻", this.#at);
			}

			if (this.markdownElementContent.includes("别着急嘛，boss又不会跑")) {
				const regx = /别着急嘛，boss又不会跑，还有(\d+)秒冷却/;
				const seconds = this.markdownElementContent.match(regx)?.[1];
				const autoChallengeFlag = linPluginAPI.getConfig("autoChallengeFlag");

				pluginLog("别着急嘛，boss又不会跑==>等待时间", seconds);

				if (Number(seconds) > 10 && autoChallengeFlag) {
					const challengeCmd = linPluginAPI.getConfig("challengeCmd");
					await sleep(Number(seconds) * 1000 + 3000);
					this.sendGroupMessage(
						this.#pugongGroup,
						` ${challengeCmd}`,
						this.#at
					);
				} else {
					await sleep(3000);
					this.sendGroupMessage(this.#pugongGroup, " 普攻", this.#at);
				}
			}

			// if (this.markdownElementContent.includes("你距离下一次挑战boss，还有")) {
			// 	const regx = /你距离下一次挑战boss，还有(\d+)秒冷却/;
			// 	const seconds = this.markdownElementContent.match(regx)?.[1];
			// 	const autoChallengeFlag = linPluginAPI.getConfig("autoChallengeFlag");

			// 	pluginLog("你距离下一次挑战boss，还有==>等待时间", seconds);

			// 	if (autoChallengeFlag) {
			// 		const challengeCmd = linPluginAPI.getConfig("challengeCmd");
			// 		await sleep(Number(seconds) * 1000 + 3000);
			// 		this.sendGroupMessage(
			// 			this.#pugongGroup,
			// 			` ${challengeCmd}`,
			// 			this.#at
			// 		);
			// 	}
			// }
		}
	}
}

export default Yunguo;
