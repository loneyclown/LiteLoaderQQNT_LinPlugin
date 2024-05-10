import { CONFIG_KEY, ConfigType } from "../../common/config";
import { sleep } from "../../common/utils";
import { At, Group } from "../lib/euphony/src";
import BaseEvent from "./baseEvent";
import Message from "./message";

const linPluginAPI = window.linPluginAPI;
const pluginLog = linPluginAPI.pluginLog;

class Yunguo extends BaseEvent {
	private config: ConfigType;
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
				return;
			}
			if (this.message.peerUid === this.config.cxhcGroupId) {
				this.onCxhc();
				return;
			}
			if (this.message.peerUid === this.config.puGongGroupId) {
				this.onBoss();
				// return;
			}
			if (this.message.peerUid === this.config.cheGroupId) {
				this.onChe();
				// return;
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

	private async setYunGuoData(data) {
		const newData = { ...this.yunGuoData, ...data };
		await linPluginAPI.setConfig("yunGuoDataCache" as any, newData);
	}

	private get yunGuoData() {
		return linPluginAPI.getConfig("yunGuoDataCache" as any);
	}

	private get markdownElementContent() {
		const e14 = this.message.elements.filter((e) => e.elementType === 14);
		const { markdownElement } = e14?.[0];
		return markdownElement?.content;
	}

	/** 跟车按钮 */
	private get genCheBtn() {
		const addBtn = this.message.findButton("加入公会组队")
			? this.message.findButton("加入公会组队")
			: this.message.findButton("加入组队");
		return addBtn;
	}

	/** 自己是否在这个车上 */
	private get isSelfInTheChe() {
		if (this.genCheBtn) {
			const str = this.markdownElementContent.split("当前人数")[1];
			if (str) {
				const userGroups = str.match(/用户:\d+/g);
				if (userGroups.find((e) => e.includes(this.config.yunGuoUid))) {
					return true;
				}
			}
			return false;
		}
		return false;
	}

	/** 草神bot 是否艾特的是当前用户 */
	private get isAtSelf() {
		return (
			this.markdownElementContent.includes(
				`at_tinyid=${this.globalData.selfUin}`
			) || this.textElementAtNtUid === this.globalData.selfUid
		);
	}

	private get atType() {
		return this.message.qqMsg.atType;
	}

	private get textElementAtNtUid() {
		const arr = this.message.elements.filter((e) => e.elementType === 1);
		const find = arr.find((e) => e.textElement.atNtUid);
		return find?.textElement.atNtUid;
	}

	async onShuaji() {
		const { shuajiFlag, shuajiAutoUpgradeFlag } = this.config;

		if (this.isAtSelf && shuajiFlag) {
			// 发车员如果在车上，停止刷级
			if (this.config.autoFaCheFlag && this.yunGuoData.isInChe) {
				return;
			}

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
				return;
			}
			if (zhandouFlag) {
				await sleep(1000);
				this.sendShuajiCmd("确定战斗");
				return;
			}
			if (zhandouConfirmFlag) {
				await sleep(1000);
				this.sendShuajiCmd("云国战斗");
				return;
			}
			if (zhandouCdFalg) {
				await sleep(75000);
				if (shuajiAutoUpgradeFlag) {
					this.sendShuajiCmd("升级");
					return;
				} else {
					this.sendShuajiCmd("简单游历");
					return;
				}
			}
			if (this.markdownElementContent.includes("恭喜你已升级成功")) {
				await sleep(1000);
				this.sendShuajiCmd("简单游历");
				return;
			}
		}
	}

	async onBoss() {
		console.log("测试云国boss", {
			qqMsg: this.message.qqMsg,
			globalData: this.globalData,
			isAtSelf: this.isAtSelf,
			atType: this.atType,
			textElementAtNtUid: this.textElementAtNtUid,
		});
		if (this.config.bossFlag && this.isAtSelf) {
			pluginLog("测试云国boss", this.message.qqMsg);
			const regex = /boss血量：(\d+)\r/;
			const bossHp = this.markdownElementContent.match(regex)?.[1];
			const isSs = this.markdownElementContent.match(/你使用了(\d+)个圣水/);

			// 消息包含boss血量或者使用圣水
			if (bossHp || isSs) {
				// 当前不在车上且未开启纯粹普攻模式
				if (!this.yunGuoData.isInChe && !this.config.chunCuiPuGong) {
					return;
				}

				const hyFlag =
					this.config.pugongAutoYaoFlag &&
					this.markdownElementContent.includes("无法继续战斗") &&
					!this.markdownElementContent.includes("成功复活");

				if (hyFlag) {
					await sleep(1000);
					this.sendBossCmd(this.config.yaoshuiCmd);
					return;
				}

				if (
					this.markdownElementContent.includes("你们击败了boss") ||
					this.config.diaoShuiAutoFaCheFlag
				) {
					let arr = this.markdownElementContent.split("\r\r***\r\r");
					arr = arr.filter((x) => x.includes("用户:"));
					let flag = false;
					arr.forEach((value) => {
						if (
							value.includes("恭喜获得时空跳跃药水") &&
							value.includes(this.config.yunGuoUid)
						) {
							flag = true;
						}
					});
					if (flag) {
						await sleep(1000);
						this.sendBossCmd(this.config.faCheCmd);
						return;
					}
				}

				await sleep(3000);
				this.sendBossCmd("普攻");
				return;
			}

			if (this.config.autoFaCheFlag && !this.yunGuoData.isFaCheCD) {
				const cdRegex = /别着急嘛，boss又不会跑，还有(\d+)秒冷却/;
				const seconds = this.markdownElementContent.match(cdRegex)?.[1];
				if (seconds && Number.isNaN(Number(seconds)) && Number(seconds) > 10) {
					await this.setYunGuoData({ isFaCheCD: true, isInChe: false });
					if (this.config.shuajiFlag) {
						await sleep(1000);
						this.sendShuajiCmd("简单游历");
						return;
					}
					await sleep(Number(seconds) * 1000 + 3000);
					this.sendCheCmd(this.config.faCheCmd);
					return;
				}
			}
		}
	}

	async onChe() {
		pluginLog("测试云国车", this.message.qqMsg);
		console.log("测试云国车", {
			qqMsg: this.message.qqMsg,
			globalData: this.globalData,
			isAtSelf: this.isAtSelf,
			atType: this.atType,
			textElementAtNtUid: this.textElementAtNtUid,
		});

		// 此处处理不需要艾特自己的消息
		// 发现组队信息
		if (this.genCheBtn) {
			// 跟车员
			if (this.config.autoGenCheFlag) {
				if (this.markdownElementContent.includes("加入了组队")) {
					const [str1, str2] = this.markdownElementContent.split("加入了组队");
					const uid = str1.match(/用户:(\d+)\r/)[1];
					if (uid && uid === this.config.yunGuoUid) {
						const str3 = str2.split("当前人数")[0];
						const currHeaderUid = str3.match(/用户:(\d+)\r/)[1];
						if (currHeaderUid) {
							await this.setYunGuoData({ currHeaderUid });
						}
					}
				}
				if (!this.isSelfInTheChe) {
					const genCheCmdTemp = `${this.genCheBtn.data}确定`;
					await this.setYunGuoData({ genCheCmdTemp });
					// this.yunGuoData = {
					// 	genCheCmdTemp,
					// };
					await sleep(2000);
					this.sendCheCmd(genCheCmdTemp);
					return;
				}
				const genCheCmdTemp = this.yunGuoData.genCheCmdTemp;
				if (genCheCmdTemp) {
					// this.yunGuoData = { genCheCmdTemp: "" };
					await this.setYunGuoData({ genCheCmdTemp: "" });
					return;
				}
			}
			// 发车员
			if (this.config.autoFaCheFlag) {
				const faQiRenUid = this.markdownElementContent.match(/用户:(\d+)/)[1];
				if (faQiRenUid && faQiRenUid === this.config.yunGuoUid) {
					// 发起组队
					if (this.markdownElementContent.includes("发起了组队")) {
						// 等待2分钟
						await sleep(120 * 1000);
						const cmd = this.markdownElementContent.includes("公会")
							? "开始公会组队挑战"
							: "开始组队挑战";
						this.sendCheCmd(cmd);
						return;
					}
					// 开始组队挑战
					if (this.markdownElementContent.includes("开始了组队挑战")) {
						await this.setYunGuoData({ isInChe: true, isFaCheCD: false });
						// this.yunGuoData.isInChe = true;
						// this.yunGuoData.isFaCheCD = false;
						await sleep(3000);
						this.sendBossCmd("普攻");
						return;
					}
					return;
				}
			}
		}

		// 此处处理需要艾特自己的消息
		if (this.isAtSelf) {
			// 只有开启了自动跟车或者自动发车才执行
			if (this.config.autoFaCheFlag || this.config.autoGenCheFlag) {
				if (this.markdownElementContent.match(/你的(金币|花)不足/)) {
					await linPluginAPI.setConfig(CONFIG_KEY.autoFaCheFlag, false);
					await linPluginAPI.setConfig(CONFIG_KEY.autoGenCheFlag, false);
					return;
				}
			}
			// 卡队
			if (this.markdownElementContent.includes("你已经加入了别人的组队")) {
				await sleep(1000);
				this.sendCheCmd("放弃挑战");
				return;
			}
			if (this.markdownElementContent.includes("你放弃了boss挑战")) {
				const genCheCmdTemp = this.yunGuoData.genCheCmdTemp;
				if (genCheCmdTemp) {
					await sleep(1000);
					this.sendCheCmd(genCheCmdTemp);
				}
			}
			// 加入组队cd
			const cdRegex = /请等待\d+秒后再次点击加入/;
			const seconds = this.markdownElementContent.match(cdRegex)?.[1];
			if (
				this.markdownElementContent.match(cdRegex) &&
				this.yunGuoData.genCheCmdTemp &&
				seconds &&
				Number.isNaN(Number(seconds))
			) {
				await sleep(Number(seconds) * 1000);
				if (this.yunGuoData.genCheCmdTemp) {
					this.sendCheCmd(this.yunGuoData.genCheCmdTemp);
				}
				return;
			}
		}
	}

	/** 持续合成 */
	async onCxhc() {
		const hcBtn = this.message.findButton("确定合成");
		const msgUid = this.markdownElementContent.match(/用户(:|：)(\d+)/)?.[2];
		if (msgUid && msgUid === this.config.yunGuoUid) {
			if (hcBtn) {
				await sleep(1000);
				await this.setYunGuoData({ hcCmdTemp: hcBtn.data });
				this.sendCmd(new Group(this.config.cxhcGroupId), hcBtn.data);
				return;
			}
			if (this.markdownElementContent.includes("合成成功")) {
				await this.setYunGuoData({ hcCmdTemp: "" });
				return;
			}
		}
		if (
			this.markdownElementContent.includes("合成失败") &&
			this.yunGuoData.hcCmdTemp &&
			this.atType === 6 &&
			this.textElementAtNtUid === this.globalData.selfUid
		) {
			await sleep(1000);
			this.sendCmd(
				new Group(this.config.cxhcGroupId),
				this.yunGuoData.hcCmdTemp
			);
		}
	}
}

export default Yunguo;
