import { CONFIG_KEY, ConfigType } from "../../common/config";
import { sleep } from "../../common/utils";
import { At, Group } from "../lib/euphony/src";
import BaseEvent from "./baseEvent";
import Message from "./message";

const linPluginAPI = window.linPluginAPI;
const pluginLog = linPluginAPI.pluginLog;

class Yunguo extends BaseEvent {
	private config: ConfigType;
	// private groups: Map<string, Group>;
	private globalData: GlobalData;

	constructor(message: Message) {
		super(message);
		this.config = linPluginAPI.getConfigAll();
		this.globalData = linPluginAPI.getGlobalData();
	}

	onRecvActiveMsg() {
		// 只接受草神消息
		if (this.message.senderUin === "2854200865") {
			if (this.message.peerUin === this.config.shuajiGroupId) {
				this.onShuaji();
			}
			if (this.message.peerUid === this.config.puGongGroupId) {
				this.onBoss();
			}
			if (this.message.peerUid === this.config.cheGroupId) {
				this.onChe();
			}
		}
	}

	private sendCmd(group: Group, msg: string) {
		const at = new At(this.message.senderUin, this.message.senderUid);
		this.sendGroupMessage(group, ` ${msg}`, at);
	}

	private sendShuajiCmd(msg: string) {
		this.sendCmd(new Group(this.config.shuajiGroupId), msg);
	}
	private sendBossCmd(msg: string) {
		this.sendCmd(new Group(this.config.puGongGroupId), msg);
	}
	private sendCheCmd(msg: string) {
		this.sendCmd(new Group(this.config.cheGroupId), msg);
	}

	private set yunGuoData(data: GlobalData["yunguo"]) {
		linPluginAPI.setGlobalData({
			...this.globalData,
			yunguo: { ...this.globalData.yunguo, ...data },
		});
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
			`at_tinyid=${this.globalData.selfUin}`
		);
	}

	async onShuaji() {
		const { shuajiFlag, shuajiAutoUpgradeFlag } = this.config;

		if (this.isAtSelf && shuajiFlag) {
			/** 当前消息是简单游历回执 */
			const youliFlag =
				this.markdownElementContent.includes("本次游历平平无奇");
			/** 当前消息是云国战斗回执 */
			const zhandouFlag = !!this.message.findButton("确定战斗");
			/** 当前消息是确定战斗回执 */
			const zhandouConfirmFlag =
				(this.markdownElementContent.includes("你击败了") &&
					this.markdownElementContent.includes("点经验升级下一等级")) ||
				this.markdownElementContent.match(/你被(.+)击败了/);
			/** 是否进入战斗cd */
			const zhandouCdFalg =
				this.markdownElementContent.includes("距离下一次战斗");

			if (youliFlag) {
				await sleep(1000);
				this.sendShuajiCmd("云国战斗");
			}
			if (zhandouFlag) {
				await sleep(1000);
				this.sendShuajiCmd("确定战斗");
			}
			if (zhandouConfirmFlag) {
				await sleep(1000);
				this.sendShuajiCmd("云国战斗");
			}
			if (zhandouCdFalg) {
				await sleep(75000);
				if (shuajiAutoUpgradeFlag) {
					this.sendShuajiCmd("升级");
				} else {
					this.sendShuajiCmd("简单游历");
				}
			}
			if (this.markdownElementContent.includes("恭喜你已升级成功")) {
				await sleep(1000);
				this.sendShuajiCmd("简单游历");
			}
		}
	}

	async onBoss() {
		const bossFlag = linPluginAPI.getConfig(CONFIG_KEY.bossFlag);

		if (this.isAtSelf && bossFlag) {
			// pluginLog("测试云国boss", this.message.qqMsg);
			const regex = /boss血量：(\d+)\r/;
			const match = this.markdownElementContent.match(regex);
			const bossHp = match?.[1];

			if (
				(bossHp && this.markdownElementContent.includes("请决定下一步操作")) ||
				this.markdownElementContent.match(/你使用了(\d+)个圣水/)
			) {
				await sleep(3000);
				this.sendBossCmd("普攻");
				return;
			}

			if (this.markdownElementContent.includes("无法继续战斗")) {
				const pugongAutoYaoFlag = linPluginAPI.getConfig(
					CONFIG_KEY.pugongAutoYaoFlag
				);
				if (pugongAutoYaoFlag) {
					const yaoshuiCmd = linPluginAPI.getConfig(CONFIG_KEY.yaoshuiCmd);
					await sleep(1000);
					this.sendBossCmd(yaoshuiCmd);
					return;
				} else {
					await sleep(3000);
					this.sendBossCmd("普攻");
					return;
				}
			}

			if (this.markdownElementContent.includes("你击败了boss")) {
				if (this.config.autoGenCheFlag) {
					await sleep(3000);
					this.sendBossCmd(this.config.faCheCmd);
					return;
				}
			}

			const seconds =
				this.markdownElementContent.match(
					/你还还有(\d+)秒冷却才能发起组队/
				)?.[1];
			if (
				seconds &&
				!Number.isNaN(Number(seconds)) &&
				this.config.autoFaCheFlag
			) {
				await sleep(Number(seconds) * 1000 + 3000);
				this.sendCheCmd(this.config.faCheCmd);
				return;
			}
		}
	}

	async onChe() {
		pluginLog("测试云国车", this.message.qqMsg);

		if (this.config.autoFaCheFlag || this.config.autoGenCheFlag) {
			if (this.markdownElementContent.match(/你的(金币|花)不足/)) {
				await linPluginAPI.setConfig(CONFIG_KEY.autoFaCheFlag, false);
				await linPluginAPI.setConfig(CONFIG_KEY.autoGenCheFlag, false);
				return;
			}

			if (
				this.markdownElementContent.match(/请等待\d+秒后再次点击加入/) &&
				this.yunGuoData.genCheCmdTemp
			) {
				await sleep(2000);
				this.sendCheCmd(this.yunGuoData.genCheCmdTemp);
				return;
			}

			if (this.markdownElementContent.includes("发起了组队")) {
				const faQiRenUid = this.markdownElementContent.match(/用户:(\d+)/)[1];
				if (faQiRenUid && faQiRenUid === this.config.yunGuoUid) {
					await sleep(120 * 1000);
					this.sendCheCmd(
						this.markdownElementContent.includes("公会")
							? "开始公会组队挑战"
							: "开始组队挑战"
					);
					return;
				}
			}

			const addBtn = this.message.findButton("加入公会组队")
				? this.message.findButton("加入公会组队")
				: this.message.findButton("加入组队");
			if (addBtn) {
				const str = this.markdownElementContent.split("当前人数")[1];
				if (str) {
					if (this.config.autoGenCheFlag) {
						const userGroups = str.match(/用户:\d+/g);
						if (!userGroups.find((e) => e.includes(this.config.yunGuoUid))) {
							const genCheCmdTemp = `${addBtn.data}确定`;
							this.yunGuoData = {
								genCheCmdTemp,
							};
							await sleep(2000);
							this.sendCheCmd(genCheCmdTemp);
							return;
						} else {
							const genCheCmdTemp = this.yunGuoData.genCheCmdTemp;
							if (genCheCmdTemp) {
								this.yunGuoData = { genCheCmdTemp: "" };
								return;
							}
						}
						return;
					}
				}
			}
		}
	}
}

export default Yunguo;
