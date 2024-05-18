import { ConfigType } from "../../common/config";
import { sleep } from "../../common/utils";
import {
	At,
	Group as EuphonyGroup,
	MessageChain,
	PlainText,
} from "../lib/euphony/src";
import BaseEvent from "./baseEvent";
import Message from "./message";

const linPluginAPI = window.linPluginAPI;
const pluginLog = linPluginAPI.pluginLog;

class Group extends EuphonyGroup {
	private at: At;

	constructor(groupId: number, message: Message) {
		super(groupId);
		this.at = new At(message.senderUin, message.senderUid);
	}

	sendCmd(msg: string) {
		const messageChain = new MessageChain();
		messageChain.append(this.at);
		messageChain.append(new PlainText(msg));
		this.sendMessage(messageChain);
	}
}

class Yunguo extends BaseEvent {
	private config: ConfigType;
	private globalData: GlobalData;
	private groups: Map<
		"sj" | "boss" | "che" | "hc" | "G定时指令" | "G自定义回执",
		Group
	> = new Map();

	constructor(message: Message) {
		super(message);
		this.config = linPluginAPI.getConfigAll() as ConfigType;
		this.globalData = linPluginAPI.getGlobalData();
		this.groups.set("sj", new Group(this.config.shuajiGroupId, message));
		this.groups.set("boss", new Group(this.config.puGongGroupId, message));
		this.groups.set("che", new Group(this.config.cheGroupId, message));
		this.groups.set("hc", new Group(this.config.cxhcGroupId, message));
		this.groups.set("G定时指令", new Group(this.config.定时指令群, message));
		this.groups.set(
			"G自定义回执",
			new Group(this.config.自定义回执群, message)
		);
	}

	onRecvActiveMsg() {
		// 只接受草神消息
		if (this.message.senderUin === "2854200865") {
			if (this.config.shuajiFlag) {
				this.onShuaji();
			}
			if (this.config.cxhcFlag) {
				this.onCxhc();
			}
			if (this.config.bossFlag) {
				this.onBoss();
			}
			if (this.config.定时指令Flag) {
				this.on定时指令();
			}
			if (this.config.自定义回执Flag) {
				this.on自定义回执();
			}
			// if (this.message.peerUin === this.config.shuajiGroupId) {
			// 	this.onShuaji();
			// 	return;
			// }
			// if (this.message.peerUid === this.config.cxhcGroupId) {
			// 	this.onCxhc();
			// 	return;
			// }
			// if (this.message.peerUid === this.config.puGongGroupId) {
			// 	this.onBoss();
			// 	// return;
			// }
			// if (this.message.peerUid === this.config.cheGroupId) {
			// 	this.onChe();
			// 	// return;
			// }
		}
	}

	// private getGroup()

	// private sendCmd(group: Group, msg: string) {
	// 	const at = new At(this.message.senderUin, this.message.senderUid);
	// 	this.sendGroupMessage(group, ` ${msg}`, at);
	// }

	// private sendShuajiCmd(msg: string) {
	// 	this.sendCmd(new Group(this.config.shuajiGroupId), msg);
	// }
	// private sendBossCmd(msg: string) {
	// 	this.sendCmd(new Group(this.config.puGongGroupId), msg);
	// }
	// private sendCheCmd(msg: string) {
	// 	this.sendCmd(new Group(this.config.cheGroupId), msg);
	// }

	private async setYunGuoData(data) {
		const newData = { ...this.yunGuoData, ...data };
		await linPluginAPI.setConfig("yunGuoDataCache", newData);
	}

	private get yunGuoData() {
		return linPluginAPI.getConfig("yunGuoDataCache");
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

	/** 当前使用物品的人是不是自己 */
	private get isUseItemSelf() {
		if (this.markdownElementContent.includes("你使用了")) {
			const regx = /\r\r>用户:(\d+)\[/;
			const match = this.markdownElementContent.match(regx);
			if (match) {
				const uid = match[1];
				return uid === this.config.yunGuoUid;
			}
		}
		return false;
	}

	private get atType() {
		return this.message.qqMsg.atType;
	}

	private get textElementAtNtUid() {
		const arr = this.message.elements.filter((e) => e.elementType === 1);
		const find = arr.find((e) => e.textElement.atNtUid);
		return find?.textElement.atNtUid;
	}

	private getNumberValue(value: any) {
		if (typeof value === "number") {
			return value;
		}
		if (typeof value === "string" && !Number.isNaN(Number(value))) {
			return Number(value);
		}
		return 0;
	}

	async onShuaji() {
		const { shuajiAutoUpgradeFlag } = this.config;
		const sj = this.groups.get("sj");

		if (this.isAtSelf && this.message.peerUin === this.config.shuajiGroupId) {
			// 发车员如果在车上，停止刷级
			if (this.config.autoFaCheFlag && this.yunGuoData.isInChe) {
				return;
			}

			/** 当前消息是确定战斗回执 */
			const zhandouConfirmFlag =
				(this.markdownElementContent.includes("你击败了") &&
					this.markdownElementContent.includes("点经验升级下一等级")) ||
				this.markdownElementContent.match(/你被(.+)击败了/);

			if (this.markdownElementContent.includes("本次游历平平无奇")) {
				await sleep(1000);
				sj.sendCmd("云国战斗");
				return;
			}
			if (!!this.message.findButton("确定战斗")) {
				await sleep(1000);
				sj.sendCmd("确定战斗");
				return;
			}
			if (zhandouConfirmFlag) {
				await sleep(1000);
				sj.sendCmd("云国战斗");
				return;
			}
			if (this.markdownElementContent.includes("距离下一次战斗")) {
				await sleep(75000);
				if (shuajiAutoUpgradeFlag) {
					sj.sendCmd("升级");
					return;
				} else {
					sj.sendCmd("简单游历");
					return;
				}
			}
			if (this.markdownElementContent.includes("恭喜你已升级成功")) {
				await sleep(1000);
				sj.sendCmd("简单游历");
				return;
			}
		}
	}

	/** 持续合成 */
	async onCxhc() {
		if (this.message.peerUid !== this.config.cxhcGroupId) {
			return;
		}
		const hcBtn = this.message.findButton("确定合成");
		const msgUid = this.markdownElementContent.match(/用户(:|：)(\d+)/)?.[2];
		const hc = this.groups.get("hc");
		if (msgUid && msgUid === this.config.yunGuoUid) {
			if (hcBtn) {
				await sleep(1000);
				await this.setYunGuoData({ hcCmdTemp: hcBtn.data });
				hc.sendCmd(hcBtn.data);
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
			hc.sendCmd(this.yunGuoData.hcCmdTemp);
		}
	}

	async onBoss() {
		if (this.message.peerUid !== this.config.puGongGroupId) {
			return;
		}

		console.log("测试云国boss", {
			qqMsg: this.message.qqMsg,
			globalData: this.globalData,
			isAtSelf: this.isAtSelf,
			atType: this.atType,
			textElementAtNtUid: this.textElementAtNtUid,
			isUseItemSelf: this.isUseItemSelf,
		});

		const isSs =
			this.markdownElementContent.match(/你使用了(\d+)个圣水/) &&
			this.isUseItemSelf;

		if (this.isAtSelf || isSs) {
			const boss = this.groups.get("boss");
			const regex = /boss血量：(\d+)\r/;
			const bossHp = this.markdownElementContent.match(regex)?.[1];
			const tuan =
				this.markdownElementContent.includes("团本") &&
				this.markdownElementContent.includes("血量");

			// const tuan_s = this.getNumberValue(
			// 	this.markdownElementContent.match(
			// 		/别着急嘛，tuan又不会跑，还有(\d+)秒冷却/
			// 	)[1]
			// );
			// if (tuan_s > 0) {
			// 	await sleep(tuan_s * 1000);
			// 	boss.sendCmd(tuan ? "团本普攻" : "普攻");
			// 	return;
			// }

			// 消息包含boss血量或者使用圣水
			if (bossHp || isSs || tuan) {
				const hyFlag =
					this.config.pugongAutoYaoFlag &&
					this.markdownElementContent.includes("无法继续战斗") &&
					!this.markdownElementContent.includes("成功复活");

				if (hyFlag) {
					await sleep(1000);
					boss.sendCmd(this.config.yaoshuiCmd);
					return;
				}

				if (this.markdownElementContent.includes("你们击败了boss")) {
					return;
				}

				if (isSs) {
					await sleep(1000);
					boss.sendCmd(tuan ? "团本普攻" : "普攻");
					return;
				}

				if (this.config.fubenSkillFlag) {
					/** 技能点 */
					const skillPoints = this.getNumberValue(
						this.markdownElementContent.match(/技能点：(\d+)\r/)?.[1]
					);
					if (
						skillPoints >= (this.config.fubenPointsRequiredForSkills || 999999)
					) {
						await sleep(3000);
						boss.sendCmd(
							`${tuan ? "团本技能" : "副本技能"}${this.config.fubenSkillId}`
						);
						return;
					}
				}

				await sleep(3000);
				boss.sendCmd(tuan ? "团本普攻" : "普攻");
				return;
			}
		}
	}

	// async onBoss() {
	// 	console.log("测试云国boss", {
	// 		qqMsg: this.message.qqMsg,
	// 		globalData: this.globalData,
	// 		isAtSelf: this.isAtSelf,
	// 		atType: this.atType,
	// 		textElementAtNtUid: this.textElementAtNtUid,
	// 	});
	// 	if (this.config.bossFlag && this.isAtSelf) {
	// 		// pluginLog("测试云国boss", this.message.qqMsg);
	// 		const regex = /boss血量：(\d+)\r/;
	// 		const bossHp = this.markdownElementContent.match(regex)?.[1];
	// 		const isSs = this.markdownElementContent.match(/你使用了(\d+)个圣水/);

	// 		// 消息包含boss血量或者使用圣水
	// 		if (bossHp || isSs) {
	// 			// 当前不在车上且未开启纯粹普攻模式
	// 			if (!this.yunGuoData.isInChe && !this.config.chunCuiPuGong) {
	// 				return;
	// 			}

	// 			const hyFlag =
	// 				this.config.pugongAutoYaoFlag &&
	// 				this.markdownElementContent.includes("无法继续战斗") &&
	// 				!this.markdownElementContent.includes("成功复活");

	// 			if (hyFlag) {
	// 				await sleep(1000);
	// 				this.sendBossCmd(this.config.yaoshuiCmd);
	// 				return;
	// 			}

	// 			if (
	// 				this.markdownElementContent.includes("你们击败了boss") ||
	// 				this.config.diaoShuiAutoFaCheFlag
	// 			) {
	// 				let arr = this.markdownElementContent.split("\r\r***\r\r");
	// 				arr = arr.filter((x) => x.includes("用户:"));
	// 				let flag = false;
	// 				arr.forEach((value) => {
	// 					if (
	// 						value.includes("恭喜获得时空跳跃药水") &&
	// 						value.includes(this.config.yunGuoUid)
	// 					) {
	// 						flag = true;
	// 					}
	// 				});
	// 				if (flag) {
	// 					await sleep(2000);
	// 					this.sendBossCmd(this.config.xuCheCmd);
	// 					return;
	// 				}
	// 			}

	// 			await sleep(3000);
	// 			this.sendBossCmd("普攻");
	// 			return;
	// 		}

	// 		if (this.config.autoFaCheFlag && !this.yunGuoData.isFaCheCD) {
	// 			const cdRegex = /别着急嘛，boss又不会跑，还有(\d+)秒冷却/;
	// 			const seconds = this.markdownElementContent.match(cdRegex)?.[1];
	// 			if (seconds && Number.isNaN(Number(seconds)) && Number(seconds) > 10) {
	// 				await this.setYunGuoData({ isFaCheCD: true, isInChe: false });
	// 				if (this.config.shuajiFlag) {
	// 					await sleep(1000);
	// 					this.sendShuajiCmd("简单游历");
	// 					return;
	// 				}
	// 				await sleep(Number(seconds) * 1000 + 3000);
	// 				this.sendCheCmd(this.config.faCheCmd);
	// 				return;
	// 			}
	// 		}
	// 	}
	// }

	// async onChe() {
	// 	// pluginLog("测试云国车", this.message.qqMsg);
	// 	console.log("测试云国车", {
	// 		qqMsg: this.message.qqMsg,
	// 		globalData: this.globalData,
	// 		isAtSelf: this.isAtSelf,
	// 		atType: this.atType,
	// 		textElementAtNtUid: this.textElementAtNtUid,
	// 	});

	// 	// 此处处理不需要艾特自己的消息
	// 	// 发现组队信息
	// 	if (this.genCheBtn) {
	// 		// 跟车员
	// 		if (this.config.autoGenCheFlag) {
	// 			// if (this.markdownElementContent.includes("加入了组队")) {
	// 			// 	const [str1, str2] = this.markdownElementContent.split("加入了组队");
	// 			// 	const uid = str1.match(/用户:(\d+)\r/)[1];
	// 			// 	if (uid && uid === this.config.yunGuoUid) {
	// 			// 		const str3 = str2.split("当前人数")[0];
	// 			// 		const currHeaderUid = str3.match(/用户:(\d+)\r/)[1];
	// 			// 		if (currHeaderUid) {
	// 			// 			await this.setYunGuoData({ currHeaderUid });
	// 			// 		}
	// 			// 	}
	// 			// }
	// 			if (!this.isSelfInTheChe) {
	// 				const genCheCmdTemp = `${this.genCheBtn.data}确定`;
	// 				await this.setYunGuoData({
	// 					genCheCmdTemp,
	// 					gencheCmdTempBase: genCheCmdTemp,
	// 				});
	// 				await sleep(2000);
	// 				this.sendCheCmd(genCheCmdTemp);
	// 				return;
	// 			}
	// 			const genCheCmdTemp = this.yunGuoData.genCheCmdTemp;
	// 			if (genCheCmdTemp) {
	// 				await this.setYunGuoData({ genCheCmdTemp: "" });
	// 				return;
	// 			}
	// 		}
	// 		// 发车员
	// 		if (this.config.autoFaCheFlag) {
	// 			const faQiRenUid = this.markdownElementContent.match(/用户:(\d+)/)[1];
	// 			if (faQiRenUid && faQiRenUid === this.config.yunGuoUid) {
	// 				// 发起组队
	// 				if (this.markdownElementContent.includes("发起了组队")) {
	// 					// 等待2分钟
	// 					await sleep(120 * 1000);
	// 					const cmd = this.markdownElementContent.includes("公会")
	// 						? "开始公会组队挑战"
	// 						: "开始组队挑战";
	// 					this.sendCheCmd(cmd);
	// 					return;
	// 				}
	// 				return;
	// 			}
	// 		}
	// 	}

	// 	// 此处处理需要艾特自己的消息
	// 	if (this.isAtSelf) {
	// 		// 只有开启了自动跟车或者自动发车才执行
	// 		if (this.config.autoFaCheFlag || this.config.autoGenCheFlag) {
	// 			if (this.markdownElementContent.match(/你的(金币|花)不足/)) {
	// 				await linPluginAPI.setConfig(CONFIG_KEY.autoFaCheFlag, false);
	// 				await linPluginAPI.setConfig(CONFIG_KEY.autoGenCheFlag, false);
	// 				return;
	// 			}

	// 			// 开始组队挑战
	// 			if (this.markdownElementContent.includes("开始了组队挑战")) {
	// 				await this.setYunGuoData({ isInChe: true, isFaCheCD: false });
	// 				await sleep(3000);
	// 				this.sendBossCmd("普攻");
	// 				return;
	// 			}

	// 			// 卡队
	// 			if (this.markdownElementContent.includes("你已经加入了别人的组队")) {
	// 				await sleep(1000);
	// 				this.sendCheCmd("放弃挑战");
	// 				return;
	// 			}
	// 			if (this.markdownElementContent.includes("你放弃了boss挑战")) {
	// 				await sleep(1000);
	// 				this.sendCheCmd(this.yunGuoData.gencheCmdTempBase);
	// 			}

	// 			// 加入组队cd
	// 			const cdRegex = /请等待\d+秒后再次点击加入/;
	// 			const seconds = this.markdownElementContent.match(cdRegex)?.[1];
	// 			if (
	// 				this.markdownElementContent.match(cdRegex) &&
	// 				this.yunGuoData.genCheCmdTemp &&
	// 				seconds &&
	// 				Number.isNaN(Number(seconds))
	// 			) {
	// 				await sleep(Number(seconds) * 1000);
	// 				this.sendCheCmd(this.yunGuoData.gencheCmdTempBase);
	// 				return;
	// 			}
	// 		}
	// 	}

	// 	// 此处处理自己使用某物品的消息
	// 	if (this.isUseItemSelf) {
	// 		if (this.markdownElementContent.includes("时空跳跃药水")) {
	// 			await this.setYunGuoData({ isInChe: false, isFaCheCD: false });
	// 			await sleep(2000);
	// 			this.sendCheCmd(this.config.faCheCmd);
	// 			return;
	// 		}
	// 	}
	// }

	// /** 持续合成 */
	// async onCxhc() {
	// 	const hcBtn = this.message.findButton("确定合成");
	// 	const msgUid = this.markdownElementContent.match(/用户(:|：)(\d+)/)?.[2];
	// 	if (msgUid && msgUid === this.config.yunGuoUid) {
	// 		if (hcBtn) {
	// 			await sleep(1000);
	// 			await this.setYunGuoData({ hcCmdTemp: hcBtn.data });
	// 			this.sendCmd(new Group(this.config.cxhcGroupId), hcBtn.data);
	// 			return;
	// 		}
	// 		if (this.markdownElementContent.includes("合成成功")) {
	// 			await this.setYunGuoData({ hcCmdTemp: "" });
	// 			return;
	// 		}
	// 	}
	// 	if (
	// 		this.markdownElementContent.includes("合成失败") &&
	// 		this.yunGuoData.hcCmdTemp &&
	// 		this.atType === 6 &&
	// 		this.textElementAtNtUid === this.globalData.selfUid
	// 	) {
	// 		await sleep(1000);
	// 		this.sendCmd(
	// 			new Group(this.config.cxhcGroupId),
	// 			this.yunGuoData.hcCmdTemp
	// 		);
	// 	}
	// }

	async on定时指令() {
		if (this.message.peerUin !== this.config.定时指令群) {
			return;
		}
		const G定时指令 = this.groups.get("G定时指令");
		await sleep((this.config.定时指令间隔 ?? 0) * 1000);
		if (this.config.定时指令Flag) {
			G定时指令.sendCmd(this.config.定时指令);
		}
	}

	async on自定义回执() {
		if (this.message.peerUin !== this.config.自定义回执群) {
			return;
		}
		const G自定义回执 = this.groups.get("G自定义回执");
		const flag =
			this.markdownElementContent.includes(this.config.自定义回执关键词) ||
			this.message.findButton(this.config.自定义回执关键词) ||
			new RegExp(this.config.自定义回执关键词).test(
				this.markdownElementContent
			);
		if (flag) {
			await sleep((this.config.自定义回执间隔 ?? 0) * 1000);
			if (this.config.自定义回执Flag) {
				G自定义回执.sendCmd(this.config.自定义回执回复指令);
			}
		}
	}
}

export default Yunguo;
