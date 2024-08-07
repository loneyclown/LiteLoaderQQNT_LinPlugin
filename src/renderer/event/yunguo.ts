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

// 全局变量
var fenjiejishu = 0;
var songhuajishu = 0;

class Group extends EuphonyGroup {
	private at: At;
	private atcs: At;

	constructor(groupId: any, message: Message) {
		super(groupId);
		this.at = new At(message.senderUin, message.senderUid);
		this.atcs = new At("2854200865", "u_FY-uEFafkeFr4we_Y7mdEA");
	}

	sendCmd(msg: string) {
		const messageChain = new MessageChain();
		messageChain.append(this.at);
		messageChain.append(new PlainText(msg));
		this.sendMessage(messageChain);
	}

	klsendCmd(msg: string) {
		const messageChain = new MessageChain();
		messageChain.append(this.atcs);
		messageChain.append(new PlainText(msg));
		this.sendMessage(messageChain);
	}

	ygsendCmd(msg: string) {
		const messageChain = new MessageChain();
		messageChain.append(this.at);
		messageChain.append(new PlainText(msg));
		this.sendMessage(messageChain);
	}

	//无@
	wusendCmd(msg: string) {
		this.sendMessage(new PlainText(msg));
	}
}

class Yunguo extends BaseEvent {
	private config: ConfigType;
	private groups: Map<
		| "sj"
		| "boss"
		| "che"
		| "hc"
		| "G定时指令"
		| "G自定义回执"
		| "kb"
		| "ck"
		| "hs"
		| "gl"
		| "lc"
		| "fj"
		| "sc"
		| "tz"
		| "songhua"
		| "gc"
		| "傀儡"
		| "G自动出售"
		| "G自动分解"
		| "fc"
		| "打怪"
		| "闭关"
		| "其他",
		Group
	> = new Map();

	constructor(message: Message) {
		super(message);
		this.config = linPluginAPI.getConfigAll() as ConfigType;
		this.groups.set("sj", new Group(this.config.shuajiGroupId, message));
		this.groups.set("boss", new Group(this.config.puGongGroupId, message));
		this.groups.set("che", new Group(this.config.cheGroupId, message));
		this.groups.set("hc", new Group(this.config.cxhcGroupId, message));
		this.groups.set("kb", new Group(this.config.kabenGroupId, message));
		this.groups.set("ck", new Group(this.config.choukaGroupId, message));
		this.groups.set("hs", new Group(this.config.choukaGroupId, message));
		this.groups.set("gl", new Group(this.config.gonglouGroupId, message));
		this.groups.set("lc", new Group(this.config.LCGroupId, message));
		this.groups.set("fj", new Group(this.config.FJGroupId, message));
		this.groups.set("sc", new Group(this.config.HUAQIANGroupId, message));
		this.groups.set("G定时指令", new Group(this.config.定时指令群, message));
		this.groups.set(
			"G自定义回执",
			new Group(this.config.自定义回执群, message)
		);
		this.groups.set("tz", new Group(this.config.tzGroupId, message));
		// this.groups.set("songhua", new Group(this.config.songhuaGroupId, message));
		this.groups.set("fc", new Group(this.config.跟车群, message));
		this.groups.set("gc", new Group(this.config.跟车群, message));
		this.groups.set("傀儡", new Group(Number(this.message.peerUin), message));
		this.groups.set("G自动出售", new Group(this.config.自动出售_群, message));
		this.groups.set("G自动分解", new Group(this.config.自动分解_群, message));
		this.groups.set("打怪", new Group(this.config.打怪指令群, message));
		this.groups.set("闭关", new Group(this.config.闭关群, message));
		this.groups.set("其他", new Group(this.config.其他指令群, message));
	}

	onRecvActiveMsg() {
		// 只接受草神消息
		if (this.message.senderUin === "2854200865") {
			if (this.config.shuajiFlag) {
				this.onShuaji();
			}
			if (this.config.cxhcFlag || this.config.自动合成Flag) {
				// this.on合成();
			}
			if (this.config.kabenFlag) {
				this.onKaben();
			}
			if (this.config.choukaFlag || this.config.hsFlag) {
				this.onChouka();
			}
			// if (this.config.hsFlag) {
			// 	this.onHeshui();
			// }
			if (this.config.gonglouFlag) {
				this.onGonglou();
			}
			if (this.config.LCFlag) {
				this.onLingchong();
			}
			if (this.config.FJFlag) {
				this.onFenjie();
			}
			if (this.config.HUAQIANFlag) {
				this.onSancai();
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
			if (this.config.自动合成Flag) {
			}
			if (this.config.tzFlag) {
				this.onTiaozhan();
			}
			// if (this.config.songhuaFlag) {
			// 	this.onSonghua();
			// }
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
			if (this.config.自动跟车Flag) {
				this.on自动跟车();
			}
			if (this.config.自动出售_Flag) {
				this.on自动出售();
			}
			if (this.config.自动分解_Flag) {
				this.on自动分解();
			}
			if (this.config.autoFaCheFlag) {
				this.on自动发车();
			}
			if (this.config.打怪指令Flag) {
				this.on打怪();
			}
			if (this.config.闭关Flag) {
				this.on闭关();
			}
		}

		if (
			this.config.klqxqq &&
			this.config.kuilieFlag &&
			this.isAtUid &&
			this.textElementContent &&
			this.textElementContent != " " &&
			this.config.klqxqq.split(",").includes(this.message.senderUin)
		) {
			this.傀儡();
		}

		if (
			this.isAtUid &&
			this.textElementContent &&
			this.textElementContent != " " &&
			this.config.监控人ID &&
			this.config.监控人ID.includes(this.message.senderUin)
		) {
			this.其他();
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

	/**是否艾特了我(傀儡) */
	private get isAtUid() {
		return this.textElementAtUid === this.config.klQQ;
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

	private get textElementAtUid() {
		const arr = this.message.elements.filter(
			(e) =>
				e.elementType === 1 &&
				e.textElement.atType === 2 &&
				e.textElement.atUid === this.config.klQQ
		);
		const find = arr.find((e) => e.textElement.atUid);
		return find?.textElement.atUid;
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

	/**过滤字符*/
	private filterChars(input: string, charToFilter: string): string {
		return input
			.split("")
			.filter((char) => char !== charToFilter)
			.join("");
	}

	/**是否包含敏感词*/
	private containsAny(str: string, chars: string): boolean {
		// 将字符串中的逗号替换为管道符(|)，以创建一个正则表达式
		const regexStr = chars.replace(/,/g, "|");
		const regex = new RegExp(regexStr);
		return regex.test(str);
	}

	/**除法是否除尽,除不尽就加一*/
	private divideAndRoundUp(dividend: number, divisor: number): number {
		const result = dividend / divisor;
		if (result % 1 !== 0) {
			return Math.floor(result) + 1;
		} else {
			return result;
		}
	}

	private async 跟车通常处理() {
		const gc = this.groups.get("gc");
		// 发现组队信息
		if (this.genCheBtn) {
			const [str1, str2] = this.markdownElementContent.split("加入了组队");
			const 当前人数 =
				this.getNumberValue(str2?.match(/当前人数：(\d+)人/)?.[1]) ?? 999;
			// console.log({ str1, str2, 当前人数, 跟车间隔: this.config.跟车间隔 });
			const 跟车次序 = this.getNumberValue(this.config.跟车次序) - 1;
			if ((当前人数 >= 跟车次序 || 跟车次序 === 1) && !this.isSelfInTheChe) {
				const genCheCmdTemp = `${this.genCheBtn.data}确定`;
				await this.setYunGuoData({
					genCheCmdTemp,
					gencheCmdTempBase: genCheCmdTemp,
				});
				if (this.config.跟车间隔) {
					await sleep(this.config.跟车间隔);
				} else {
					await sleep(3000);
				}
				gc.sendCmd(genCheCmdTemp);
				return;
			}
		}
	}

	private async 跟车异常处理() {
		const gc = this.groups.get("gc");
		// 没钱没花了
		if (this.markdownElementContent.match(/你的(金币|花)不足/)) {
			await linPluginAPI.setConfig("自动跟车Flag", false);
			return;
		}
		// 卡队
		if (this.markdownElementContent.includes("你已经加入了别人的组队")) {
			await sleep(1000);
			gc.sendCmd("放弃挑战");
			return;
		}
		// 放弃重进
		if (this.markdownElementContent.includes("你放弃了boss挑战")) {
			await sleep(1000);
			gc.sendCmd(this.yunGuoData.gencheCmdTempBase);
		}
		// 进队cd
		if (this.markdownElementContent.match(/请等待(\d+)秒后再次点击加入/)) {
			await sleep(3000);
			gc.sendCmd(this.yunGuoData.gencheCmdTempBase);
		}
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

	async on合成() {
		if (this.message.peerUid !== this.config.cxhcGroupId) {
			return;
		}

		// console.log("测试云国合成", {
		// 	qqMsg: this.message.qqMsg,
		// 	globalData: this.globalData,
		// 	isAtSelf: this.isAtSelf,
		// 	atType: this.atType,
		// 	textElementAtNtUid: this.textElementAtNtUid,
		// 	isUseItemSelf: this.isUseItemSelf,
		// });

		const hcks = this.markdownElementContent.includes("请决定是否继续合成");
		const hcBtn = this.message.findButton("确定合成");
		const msgUid = this.markdownElementContent.match(/用户(:|：)(\d+)/)?.[2];
		const hc = this.groups.get("hc");
		if (msgUid && msgUid === this.config.yunGuoUid) {
			if (hcks) {
				await sleep(1000);
				await this.setYunGuoData({ hcCmdTemp: hcBtn.data });
				hc.sendCmd(hcBtn.data);
				return;
			}
			if (this.markdownElementContent.includes("合成成功")) {
				const page = this.yunGuoData.hcCmdTemp
					? this.divideAndRoundUp(this.yunGuoData.hcCmdTemp.split(":")[1], 5)
					: 1;
				await this.setYunGuoData({ hcCmdTemp: "" });
				const 合成卡_num = this.getNumberValue(
					this.markdownElementContent.match(/当前按合成卡数量：(\d+)/)[1]
				);
				if (
					this.config.自动合成Flag &&
					合成卡_num > this.config.自动合成_剩余合成卡
				) {
					await sleep(1000);
					await this.setYunGuoData({ 自动合成_背包页码: page });
					hc.sendCmd("背包");
				}
				return;
			}
			if (
				this.config.自动合成Flag &&
				this.markdownElementContent.includes("背包信息") &&
				!this.markdownElementContent.includes("圣物")
			) {
				await this.setYunGuoData({
					自动合成_背包页码: (this.yunGuoData.自动合成_背包页码 ?? 0) + 1,
				});
				const regex = /#■ (\d+).(.*)\r/g;
				const matches = this.markdownElementContent.matchAll(regex);
				if ([...matches].length === 0) {
					await this.setYunGuoData({ 自动合成_背包页码: 1 });
					return;
				}
				let 胚子_id: any = false;
				for (const match of this.markdownElementContent.matchAll(regex)) {
					const [, id, name] = match;
					console.log({ id, name, match });
					if (name === this.config.自动合成_胚子) {
						胚子_id = id;
						break;
					}
				}
				if (胚子_id) {
					await sleep(1000);
					hc.sendCmd(`合成${this.config.自动合成_装备id}:${胚子_id}`);
					return;
				}
				await sleep(3000);
				hc.sendCmd(`背包${this.yunGuoData.自动合成_背包页码}`);
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

	/** 卡本 */
	async onKaben() {
		const kb = this.groups.get("kb");
		if (this.isAtSelf && this.message.peerUid === this.config.kabenGroupId) {
			await sleep(2e3 + Math.random() * 1e3); //给这个sleep加个1秒以内的随机延迟，避免刷屏
			if (
				this.markdownElementContent.includes("无法继续战斗") &&
				!this.markdownElementContent.includes("成功复活")
			) {
				kb.sendCmd(this.config.yaoshuiCmd);
				await sleep(3 * 1e3 + Math.random() * 1e3);
				kb.sendCmd("普攻");
			} else {
				kb.sendCmd("普攻");
			}
			return;
		}
	}

	/** 持续抽卡 */
	async onChouka() {
		if (this.message.peerUid !== this.config.choukaGroupId) {
			return;
		}
		if (this.config.choukaFlag) {
			const choukaFalg = this.markdownElementContent.includes("恭喜你抽中");
			const CK_stopFalg = this.markdownElementContent.includes("你今日不足");
			const TIANFANGFalg =
				this.markdownElementContent.includes("恭喜你抽中天方·");
			const ckBtn = this.message.findButton("公会十连");
			const msgUid = this.markdownElementContent.match(/用户(:|：)(\d+)/)?.[2];
			const ck = this.groups.get("ck");
			if (msgUid && msgUid === this.config.yunGuoUid) {
				if (ckBtn) {
					await sleep(10 * 1e3);
					await this.setYunGuoData({ ckCmdTemp: ckBtn.data });
					ck.sendCmd(ckBtn.data);
					return;
				}

				if (TIANFANGFalg) {
					await sleep(1e3);
					ck.sendCmd("#####一级提示内容：你他吗出天方了#####");
				}

				if (CK_stopFalg) {
					await sleep(1e3);
					ck.sendCmd("抽卡停止");
					return;
				}
			}
		}
		if (this.config.hsFlag) {
			const hs = this.groups.get("hs");
			const hscmd = this.config.hscmd;
			const hsTx = /你使用了(\d+)个初级/;
			const hsTag = this.markdownElementContent.match(hsTx);

			const hsn = /药水(:|：)(\d+)个/;
			const hsNTag = this.markdownElementContent.match(hsn);
			const hsnumber = parseInt(hsTag[1], 10);
			const hsshengyunumber = parseInt(hsNTag?.[2], 10);

			const hsUid = this.markdownElementContent.match(/用户(:|：)(\d+)/)?.[2];

			if (
				hsTag &&
				hsshengyunumber >= 2 &&
				hsUid &&
				hsUid === this.config.yunGuoUid
			) {
				await sleep(1e3);
				hs.sendCmd(hscmd);
			}
		}
	}

	/**喝水 */
	// async onHeshui() {
	// 	const hs = this.groups.get("hs");
	// 	const hscmd = this.config.hscmd;
	// 	const hsTx = /你使用了(\d+)个初级/;
	// 	const hsTag = this.markdownElementContent.match(hsTx);

	// 	const hsn = /药水(:|：)(\d+)个/;
	// 	const hsNTag = this.markdownElementContent.match(hsn);
	// 	// const hsnumber = parseInt(hsTag[1], 10);
	// 	// const hsshengyunumber = parseInt(hsNTag?.[2], 10);
	// 	const hsshengyunumber = this.markdownElementContent.match(hsn)?.[2];

	// 	const hsUid = this.markdownElementContent.match(/用户(:|：)(\d+)/)?.[2];

	// 	if (hsTag && Number(hsshengyunumber) >= 2 && hsUid && hsUid === this.config.yunGuoUid) {
	// 		await sleep(1e3);
	// 		hs.sendCmd(hscmd);
	// 	}
	// }

	/**灵宠 */
	async onLingchong() {
		const lc = this.groups.get("lc");
		const backFlag = this.markdownElementContent.includes("回来了");
		const KongxianFlag = this.markdownElementContent.includes("空闲");
		const zhuangtai = /还有(\d+)秒可以召回/;
		const ZHsecond = this.markdownElementContent.match(zhuangtai)?.[1];

		if (this.isAtSelf) {
			if (KongxianFlag) {
				lc.sendCmd("派遣挖云石60");
				await sleep(60 * 60 * 1e3);
				lc.sendCmd("召回灵宠");
			}

			if (backFlag) {
				lc.sendCmd("派遣挖云石60");
				await sleep(60 * 60 * 1e3);
				lc.sendCmd("召回灵宠");
			}

			if (ZHsecond) {
				if (parseInt(ZHsecond, 10) > 0) {
					await sleep(Number(ZHsecond) * 1e3);
					lc.sendCmd("召回灵宠");
				}
			}
		}
	}

	/** 持续攻楼 */
	async onGonglou() {
		const gl = this.groups.get("gl");
		if (this.message.peerUid !== this.config.gonglouGroupId) {
			return;
		}
		const upstairsFlag = this.markdownElementContent.includes("攻占信息");
		const defeatFlag = this.markdownElementContent.includes("你击败了");
		const dengdingFlag = this.markdownElementContent.match("你已暂时到达顶层");

		if (this.isAtSelf) {
			if (upstairsFlag && !defeatFlag) {
				gl.sendCmd(this.config.yaoshuiCmd);
				await sleep(60 * 1e3 + 2e3);
				gl.sendCmd("/确定攻占");
			}

			if (defeatFlag) {
				await sleep(60 * 1e3 + 2e3);
				gl.sendCmd("/确定攻占");
			}

			if (dengdingFlag) {
				gl.sendCmd("你度过万难险阻终登上顶峰!");
			}
		}
	}

	/**分解 */
	async onFenjie() {
		if (this.isAtSelf && this.message.peerUid === this.config.FJGroupId) {
			const fj = this.groups.get("fj");
			const fenjie = this.markdownElementContent.includes("分解了圣物");
			const swmeile = this.markdownElementContent.includes("rror");
			const FJCmd = this.config.FJCmd;

			if (fenjie) {
				await sleep(2e3);
				fj.sendCmd(FJCmd);
				fenjiejishu += 1;
			}

			if (swmeile) {
				await sleep(2e3);
				fj.sendCmd(`分解完毕，从本次启动开始总共分解次数：${fenjiejishu}`);
			}
		}
	}

	/**散财童子 */
	async onSancai() {
		const sc = this.groups.get("sc");
		if (this.isAtSelf && this.message.peerUid === this.config.HUAQIANGroupId) {
			const GOUMAIFalg = this.markdownElementContent.includes("你购买了");
			const gold = this.markdownElementContent.match(/剩余(:|：)(\d+)/)?.[2];

			if (GOUMAIFalg && Number(gold) > 200000000) {
				sc.sendCmd("购买9 2");
			} else {
				await sleep(60 * 60 * 1e3);
				sc.sendCmd("购买5 5");
			}
		}
	}

	/**开始-放弃挑战 */
	async onTiaozhan() {
		if (this.isAtSelf && this.message.peerUid === this.config.tzGroupId) {
			const tz = this.groups.get("tz");
			const xinxiFalg = this.markdownElementContent.includes("战斗信息");
			const tzCmd = this.config.tzCmd;

			await sleep(2e3);
			if (!xinxiFalg) {
				tz.sendCmd(tzCmd);
			} else {
				tz.sendCmd("放弃挑战");
			}
		}
	}

	/**送花 */
	// async onSonghua() {
	// 	if (this.isAtSelf && this.message.peerUid === this.config.songhuaGroupId) {
	// 		const songhua = this.groups.get("songhua");
	// 		const song = this.markdownElementContent.includes("送了5000朵花");
	// 		const flower = this.markdownElementContent.match(/剩余鲜花(:|：)(\d+)/)?.[2];
	// 		let songhuaksCmd = this.config.songhuaksCmd;
	// 		// const songhuajsCmd = this.config.songhuajsCmd;

	// 		await sleep(2e3);
	// 		if (songhuajishu <= 0) {
	// 			await this.setYunGuoData({ songhuaCmdTemp: songhuaksCmd });
	// 		}
	// 		if (!song) {
	// 			songhuaksCmd = this.yunGuoData.songhuaCmdTemp += 1;
	// 			await this.setYunGuoData({ songhuaCmdTemp: songhuaksCmd });
	// 			songhua.sendCmd(`送花${this.yunGuoData.songhuaCmdTemp} 5000`);
	// 			songhuaksCmd += 1;
	// 			songhuajishu += 1;
	// 			await this.setYunGuoData({ songhuaCmdTemp: songhuaksCmd });
	// 			return;
	// 		}
	// 		if (Number(flower) > 200000) {
	// 			songhua.sendCmd(`送花${this.yunGuoData.songhuaCmdTemp} 5000`);
	// 			songhuajishu += 1;
	// 			songhuaksCmd = this.yunGuoData.songhuaCmdTemp += 1;
	// 			await this.setYunGuoData({ songhuaCmdTemp: songhuaksCmd });
	// 			return;
	// 		} else {
	// 			await sleep(2e3);
	// 			await this.setYunGuoData({ songhuaCmdTemp: "" });
	// 			songhua.sendCmd(`送花结束,送花人数：${songhuajishu}`);
	// 			return;
	// 		}
	// 	}
	// }

	async onBoss() {
		if (this.message.peerUid !== this.config.puGongGroupId) {
			return;
		}

		// console.log("测试云国boss", {
		// 	qqMsg: this.message.qqMsg,
		// 	globalData: this.globalData,
		// 	isAtSelf: this.isAtSelf,
		// 	atType: this.atType,
		// 	textElementAtNtUid: this.textElementAtNtUid,
		// 	isUseItemSelf: this.isUseItemSelf,
		// });

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

	async on自动出售() {
		if (this.message.peerUid !== this.config.自动出售_群) {
			return;
		}

		// console.log("测试云国on自动出售", {
		// 	qqMsg: this.message.qqMsg,
		// 	globalData: this.globalData,
		// 	isAtSelf: this.isAtSelf,
		// 	atType: this.atType,
		// 	textElementAtNtUid: this.textElementAtNtUid,
		// 	isUseItemSelf: this.isUseItemSelf,
		// });

		const G自动出售 = this.groups.get("G自动出售");
		if (this.isAtSelf) {
			if (this.markdownElementContent.match(/你卖了(.*)，获得了(\d+)金币/)) {
				const 自动出售Temp_物品id = this.yunGuoData.自动出售Temp_物品id;
				const page = 自动出售Temp_物品id
					? this.divideAndRoundUp(自动出售Temp_物品id, 5)
					: 1;
				await this.setYunGuoData({ 自动出售Temp_物品id: "" });
				await sleep(1000);
				await this.setYunGuoData({ 自动出售_背包页码: page });
				G自动出售.sendCmd(`背包${page}`);
				return;
			}

			const is物品背包 =
				this.markdownElementContent.includes("背包信息") &&
				!this.markdownElementContent.includes("圣物");
			if (is物品背包) {
				await this.setYunGuoData({
					自动出售_背包页码: (this.yunGuoData.自动出售_背包页码 ?? 0) + 1,
				});
				const regex = /#■ (\d+).(.*)\r/g;
				const matches = this.markdownElementContent.matchAll(regex);
				if ([...matches].length === 0) {
					await this.setYunGuoData({ 自动出售_背包页码: 1 });
					return;
				}
				let 物品_id: any = false;
				for (const match of this.markdownElementContent.matchAll(regex)) {
					const [, id, name] = match;
					const 自动出售_物品名称Arr: string[] =
						this.config.自动出售_物品名称.split(",");
					// console.log({ id, name, match });
					if (自动出售_物品名称Arr.includes(name)) {
						物品_id = id;
						break;
					}
				}
				if (物品_id) {
					await sleep(1000);
					await this.setYunGuoData({ 自动出售Temp_物品id: 物品_id });
					G自动出售.sendCmd(`/卖${物品_id}`);
					return;
				}
				await sleep(3000);
				G自动出售.sendCmd(`背包${this.yunGuoData.自动出售_背包页码}`);
				return;
			}
		}
	}

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

	async on自动跟车() {
		if (this.message.peerUid !== this.config.跟车群) {
			return;
		}

		// 此处处理不需要艾特自己的消息
		this.跟车通常处理();
		// 此处处理需要艾特自己的消息
		if (this.isAtSelf) {
			this.跟车异常处理();
		}
	}

	async on自动发车() {
		if (this.message.peerUid !== this.config.跟车群) {
			return;
		}

		const fc = this.groups.get("fc");
		const isSk =
			this.markdownElementContent.match(/你使用了(\d+)个时空跳跃药水/) &&
			this.isUseItemSelf;
		// 发起组队
		if (this.markdownElementContent.includes("发起了组队")) {
			// 等待发车时间
			await sleep(this.config.发车时间);
			const cmd = this.markdownElementContent.includes("公会")
				? "开始公会组队挑战"
				: "开始组队挑战";
			fc.sendCmd(cmd);
			return;
		}

		// 此处处理需要艾特自己的消息
		if (this.isAtSelf) {
			const isSs =
				this.markdownElementContent.match(/你使用了(\d+)个圣水/) &&
				this.isUseItemSelf;
			const bossXue = this.markdownElementContent.includes("boss血量");
			const regex = /boss血量：(\d+)\r/;
			const bossHp = this.markdownElementContent.match(regex)?.[1];
			const tuan =
				this.markdownElementContent.includes("团本") &&
				this.markdownElementContent.includes("血量");

			// 消息包含boss血量或者使用圣水
			if (bossXue || isSs || tuan) {
				const hyFlag =
					this.config.pugongAutoYaoFlag &&
					this.markdownElementContent.includes("无法继续战斗") &&
					!this.markdownElementContent.includes("成功复活");

				if (hyFlag) {
					await sleep(1000);
					fc.sendCmd(this.config.yaoshuiCmd);
					return;
				}

				if (this.markdownElementContent.includes("你们击败了boss")) {
					if (this.config.diaoShuiAutoFaCheFlag) {
						let arr = this.markdownElementContent.split("\r\r***\r\r");
						arr = arr.filter((x) => x.includes("用户:"));
						let flag1 = false;

						arr.forEach((value) => {
							if (value.includes("恭喜获得时空跳跃药水")) {
								if (value.includes(this.config.yunGuoUid)) {
									flag1 = true;
								}
							}
						});

						if (flag1) {
							await sleep(3e3);
							fc.sendCmd(this.config.xuCheCmd);
						}

						if (!flag1) {
							await this.setYunGuoData({ isInChe: false, isFaCheCD: false });
							await sleep(1e3);
							fc.sendCmd(this.config.faCheCmd);
						}
					} else {
						if (this.config.xuCheCmd) {
							await sleep(3e3);
							fc.sendCmd(this.config.xuCheCmd);
						} else {
							await this.setYunGuoData({ isInChe: false, isFaCheCD: false });
							await sleep(1e3);
							fc.sendCmd(this.config.faCheCmd);
						}
					}

					return;
				}

				if (isSs) {
					await sleep(1000);
					fc.sendCmd(tuan ? "团本普攻" : "普攻");
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
						fc.sendCmd(
							`${tuan ? "团本技能" : "副本技能"}${this.config.fubenSkillId}`
						);
						return;
					}
				}

				await sleep(3000);
				fc.sendCmd(tuan ? "团本普攻" : "普攻");
				return;
			}

			if (this.markdownElementContent.match(/你的(金币|花)不足/)) {
				await linPluginAPI.setConfig("autoFaCheFlag", false);
				return;
			}

			// 开始组队挑战
			if (this.markdownElementContent.includes("开始了组队挑战")) {
				await this.setYunGuoData({ isInChe: true, isFaCheCD: false });
				await sleep(3000);
				fc.sendCmd("普攻");
				return;
			}
		}

		const facheCd = this.markdownElementContent.includes("才能发起组队");
		const seconds =
			this.markdownElementContent.match(/你还还有(\d+)秒冷却才能发起组队/)?.[1];
		if (facheCd && seconds) {
			await sleep(Number(seconds) * 1e3 + 3e3);
			await this.setYunGuoData({ isInChe: false, isFaCheCD: false });
			fc.sendCmd(this.config.faCheCmd);
		}

		if (this.markdownElementContent.includes("你没有发起boss挑战")) {
			await this.setYunGuoData({ isInChe: false, isFaCheCD: false });
			await sleep(3e3);
			fc.sendCmd(this.config.faCheCmd);
			return;
		}

		if (isSk) {
			await this.setYunGuoData({ isInChe: false, isFaCheCD: false });
			await sleep(2000);
			fc.sendCmd(this.config.faCheCmd);
			return;
		}
	}

	async 傀儡() {
		const 加 = this.textElementContent.includes("+");
		if (
			(加 && !this.config.klmgc) ||
			(加 &&
				this.config.klmgc &&
				!this.containsAny(this.textElementContent, this.config.klmgc))
		) {
			const 傀儡 = this.groups.get("傀儡");
			const 傀儡信息 = this.filterChars(this.textElementContent, "+");
			console.log("傀儡", {
				qqMsg: this.message.qqMsg,
				Content: 傀儡信息,
			});

			const kuileiCmdTemp = `${傀儡信息}`;
			const 跟车次序 = this.getNumberValue(this.config.跟车次序);

			// await sleep(1500);
			if (kuileiCmdTemp.match(/去(\d+)/)) {
				const 跟车次序修改 = this.getNumberValue(
					kuileiCmdTemp.match(/去(\d+)/)?.[1]
				);
				await linPluginAPI.setConfig("跟车次序", 跟车次序修改);
				傀儡.wusendCmd(
					`当前上车次序为 ${跟车次序修改}(带头),若需要更改请发送"去xx"`
				);
			} else if (kuileiCmdTemp.includes("车头")) {
				if (kuileiCmdTemp.includes("关闭车头")) {
					await linPluginAPI.setConfig("autoFaCheFlag", false);
					await linPluginAPI.setConfig("自动跟车Flag", true);
					傀儡.wusendCmd(` 已关闭头，上车次序为 ${跟车次序}(带头)`);
				} else {
					await linPluginAPI.setConfig("autoFaCheFlag", true);
					await linPluginAPI.setConfig("自动跟车Flag", false);
					傀儡.wusendCmd(" 已成为头，立刻续车，请注意关闭其他头");
				}
			} else if (kuileiCmdTemp.includes("跟车")) {
				if (kuileiCmdTemp.includes("关闭跟车")) {
					await linPluginAPI.setConfig("自动跟车Flag", false);
					傀儡.wusendCmd(` 已关闭跟车`);
				} else {
					await linPluginAPI.setConfig("自动跟车Flag", true);
					傀儡.wusendCmd(" 已开启跟车");
				}
			} else if (kuileiCmdTemp.includes("配置")) {
				傀儡.wusendCmd(
					` 配置信息=>是否跟车: ${
						this.config.自动跟车Flag
					},上车次序为 ${跟车次序}(带车头),跟车间隔为 ${Number(
						this.config.跟车间隔
					)}毫秒,是否发车: ${this.config.autoFaCheFlag},副本指令: ${
						this.config.faCheCmd
					},发车间隔为 ${Number(this.config.发车时间)}毫秒`
				);
			} else if (kuileiCmdTemp.includes("多普攻")) {
				let cs: number = 0;
				for (let i = 0; i < 10; i++) {
					cs = cs + 1;
					sleep(1000 * (cs * 2));
					傀儡.klsendCmd("普攻");
				}
			} else if (kuileiCmdTemp.includes("多团本普攻")) {
				for (let i = 0; i < 10; i++) {
					傀儡.klsendCmd("团本普攻");
				}
			} else {
				傀儡.klsendCmd(kuileiCmdTemp);
			}
		}
	}

	// async on自动分解() {
	// 	if (this.message.peerUid !== this.config.自动分解_群) {
	// 		return;
	// 	}

	// 	// console.log("测试云国on自动分解", {
	// 	// 	qqMsg: this.message.qqMsg,
	// 	// 	globalData: this.globalData,
	// 	// 	isAtSelf: this.isAtSelf,
	// 	// 	atType: this.atType,
	// 	// 	textElementAtNtUid: this.textElementAtNtUid,
	// 	// 	isUseItemSelf: this.isUseItemSelf,
	// 	// });

	// 	const G自动分解 = this.groups.get("G自动分解");
	// 	if (this.isAtSelf) {
	// 		if (this.markdownElementContent.match(/你分解了圣物【(.*)】，获得(\d+)个云石/)) {
	// 			const 自动分解Temp_圣物id = this.yunGuoData.自动分解Temp_圣物id;
	// 			const page = 自动分解Temp_圣物id
	// 				? this.divideAndRoundUp(自动分解Temp_圣物id, 5)
	// 				: 1;
	// 			await this.setYunGuoData({ 自动分解Temp_圣物id: "" });
	// 			await sleep(1000);
	// 			await this.setYunGuoData({ 自动分解_圣物背包页码: page });
	// 			G自动分解.sendCmd(`圣物背包${page}`);
	// 			return;
	// 		}

	// 		const is圣物背包 =
	// 			this.markdownElementContent.includes("圣物背包信息")
	// 		if (is圣物背包) {
	// 			await this.setYunGuoData({
	// 				自动分解_圣物背包页码: (this.yunGuoData.自动分解_圣物背包页码 ?? 0) + 1,
	// 			});
	// 			const regex = /#■ (\d+).(.*)\(lv\.(\d+)\)\r\>主词条\：(.*)\+(((\d+)\.(\d+))|(\d+))/g;
	// 			const matches = this.markdownElementContent.matchAll(regex);
	// 			if ([...matches].length === 0) {
	// 				await this.setYunGuoData({ 自动分解_圣物背包页码: 1 });
	// 				return;
	// 			}
	// 			let 圣物_id: any = false;
	// 			for (const match of this.markdownElementContent.matchAll(regex)) {
	// 				const [, id, name, lv, type, bonus] = match;
	// 				// console.log({ id, name, lv, type, bonus, match });
	// 				if (Number(bonus) < this.getNumberValue(this.config.自动分解_主词条数值)) {
	// 					圣物_id = id;
	// 					break;
	// 				}
	// 			}
	// 			if (圣物_id) {
	// 				await sleep(1000);
	// 				await this.setYunGuoData({ 自动分解Temp_圣物id: 圣物_id });
	// 				G自动分解.sendCmd(`/分解圣物${圣物_id}确定`);
	// 				return;
	// 			}
	// 			await sleep(3000);
	// 			G自动分解.sendCmd(`圣物背包${this.yunGuoData.自动分解_圣物背包页码}`);
	// 			return;
	// 		}
	// 	}
	// }

	async on自动分解() {
		if (this.message.peerUid !== this.config.自动分解_群) {
			return;
		}

		// console.log("测试云国on自动分解", {
		// 	qqMsg: this.message.qqMsg,
		// 	globalData: this.globalData,
		// 	isAtSelf: this.isAtSelf,
		// 	atType: this.atType,
		// 	textElementAtNtUid: this.textElementAtNtUid,
		// 	isUseItemSelf: this.isUseItemSelf,
		// });

		const G自动分解 = this.groups.get("G自动分解");
		if (this.isAtSelf) {
			// if (this.markdownElementContent.match(/你分解了圣物【(.*)】，获得(\d+)个云石/)) {
			if (this.markdownElementContent.includes("圣物上限等级由自身")) {
				const 自动分解Temp_圣物id = this.yunGuoData.自动分解Temp_圣物id;
				const page = 自动分解Temp_圣物id
					? this.divideAndRoundUp(自动分解Temp_圣物id, 5)
					: 1;
				await this.setYunGuoData({ 自动分解Temp_圣物id: "" });
				await sleep(1000);
				await this.setYunGuoData({ 自动分解_圣物背包页码: page });
				G自动分解.sendCmd(`圣物背包${page}`);
				return;
			}

			const is圣物背包 = this.markdownElementContent.includes("圣物背包信息");
			if (is圣物背包) {
				await this.setYunGuoData({
					自动分解_圣物背包页码:
						(this.yunGuoData.自动分解_圣物背包页码 ?? 0) + 1,
				});
				const regex =
					/#■ (\d+).(.*)\(lv\.(\d+)\)\r\>主词条\：(.*)\+(((\d+)\.(\d+))|(\d+))/g;
				const matches = this.markdownElementContent.matchAll(regex);
				if ([...matches].length === 0) {
					await this.setYunGuoData({ 自动分解_圣物背包页码: 1 });
					return;
				}
				let 圣物_id: any = false;
				for (const match of this.markdownElementContent.matchAll(regex)) {
					const [, id, name, lv, type, bonus] = match;
					// console.log({ id, name, lv, type, bonus, match });
					if (
						Number(bonus) >=
							this.getNumberValue(this.config.自动分解_主词条数值) &&
						Number(lv) < this.getNumberValue(2)
					) {
						圣物_id = id;
						break;
					}
				}
				if (圣物_id) {
					await sleep(1000);
					await this.setYunGuoData({ 自动分解Temp_圣物id: 圣物_id });
					G自动分解.sendCmd(`升级圣物${圣物_id}`);
					return;
				}
				await sleep(3000);
				G自动分解.sendCmd(`圣物背包${this.yunGuoData.自动分解_圣物背包页码}`);
				return;
			}
		}
	}

	async on打怪() {
		if (this.message.peerUin !== this.config.打怪指令群) {
			return;
		}
		const 打怪 = this.groups.get("打怪");
		if (this.isAtSelf) {
			if (this.markdownElementContent.includes("您当前清扫的妖兽为")) {
				await sleep((this.config.打怪指令间隔 ?? 0) * 1000);
				if (this.config.打怪指令Flag) {
					打怪.ygsendCmd(this.config.打怪指令);
				}
			}
		}
	}

	async on闭关() {
		if (this.message.peerUin !== this.config.闭关群) {
			return;
		}
		const 闭关 = this.groups.get("闭关");
		if (this.isAtSelf) {
			const biguanCd = this.markdownElementContent.includes("闭关失败");
			const seconds = this.markdownElementContent.match(/还有(\d+)秒cd/)?.[1];
			if (biguanCd && seconds) {
				await sleep(Number(seconds) * 1e3 + 3e3);
				闭关.ygsendCmd(`闭关${this.config.闭关间隔}`);
			}
			if (this.markdownElementContent.includes("开始闭关")) {
				if (this.config.闭关Flag) {
					闭关.ygsendCmd(`闭关${this.config.闭关间隔}`);
				}
			}
		}
	}

	/**无@指令 */
	async 其他() {
		if (this.message.peerUin !== this.config.其他指令群) {
			return;
		}
		const 其他 = this.groups.get("其他");
		const 接收消息 = `${this.textElementContent}`;
		//消息一
		if (接收消息.includes(this.config.监控信息内容一)) {
			if (this.config.循环Flag一) {
				if (this.config.延迟Flag一) {
					await sleep((this.config.延迟时间一 ?? 1) * 1000);
					其他.wusendCmd(this.config.回复信息内容一);
				} else {
					其他.wusendCmd(this.config.回复信息内容一);
				}
			} else if (!this.config.循环Flag一 && !this.config.执行回复Flag一) {
				if (this.config.延迟Flag一) {
					await sleep((this.config.延迟时间一 ?? 1) * 1000);
					await linPluginAPI.setConfig("执行回复Flag一", true);
					其他.wusendCmd(this.config.回复信息内容一);
				} else {
					await linPluginAPI.setConfig("执行回复Flag一", true);
					其他.wusendCmd(this.config.回复信息内容一);
				}
			}
		}

		//消息二
		if (接收消息.includes(this.config.监控信息内容二)) {
			if (this.config.循环Flag二) {
				if (this.config.延迟Flag二) {
					await sleep((this.config.延迟时间二 ?? 1) * 1000);
					其他.wusendCmd(this.config.回复信息内容二);
				} else {
					其他.wusendCmd(this.config.回复信息内容二);
				}
			} else if (!this.config.循环Flag二 && !this.config.执行回复Flag二) {
				if (this.config.延迟Flag二) {
					await sleep((this.config.延迟时间二 ?? 1) * 1000);
					await linPluginAPI.setConfig("执行回复Flag二", true);
					其他.wusendCmd(this.config.回复信息内容二);
				} else {
					await linPluginAPI.setConfig("执行回复Flag二", true);
					其他.wusendCmd(this.config.回复信息内容二);
				}
			}
		}

		//消息三
		if (接收消息.includes(this.config.监控信息内容三)) {
			if (this.config.循环Flag三) {
				if (this.config.延迟Flag三) {
					await sleep((this.config.延迟时间三 ?? 1) * 1000);
					其他.wusendCmd(this.config.回复信息内容三);
				} else {
					其他.wusendCmd(this.config.回复信息内容三);
				}
			} else if (!this.config.循环Flag三 && !this.config.执行回复Flag三) {
				if (this.config.延迟Flag三) {
					await sleep((this.config.延迟时间三 ?? 1) * 1000);
					await linPluginAPI.setConfig("执行回复Flag三", true);
					其他.wusendCmd(this.config.回复信息内容三);
				} else {
					await linPluginAPI.setConfig("执行回复Flag三", true);
					其他.wusendCmd(this.config.回复信息内容三);
				}
			}
		}
	}
}

export default Yunguo;
