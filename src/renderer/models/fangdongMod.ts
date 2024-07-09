import { ConfigType } from "../../common/config";
import { sleep } from "../../common/utils";
import Message from "../event/message";
import { At, Group, MessageChain, PlainText } from "../lib/euphony/src";

class FangDongGroup extends Group {
	private at: At;
	groupId: any;

	constructor(groupId: any) {
		super(groupId);
		this.groupId = groupId;
		// this.at = new At("2854200865", "u_FY-uEFafkeFr4we_Y7mdEA");
	}

	sendCmd(msg: string, isAt = true) {
		const messageChain = new MessageChain();
		// isAt && messageChain.append(this.at);
		messageChain.append(new PlainText(msg));
		this.sendMessage(messageChain);
	}
}

export default class FangDongMod {
	/** 当前接收到的最新消息 */
	private recvActiveMsg: Message;
	/** 当前发送出去的最新消息 */
	private addSendMsg: Message;
	constructor() {}

	get config() {
		return window.linPluginAPI.getConfigAll() as ConfigType;
	}

	private async setData(data: any) {
		const newData = { ...this.data, ...data };
		await window.linPluginAPI.setConfig("fangDongDataCache", newData);
	}

	private get data() {
		return window.linPluginAPI.getConfig("fangDongDataCache");
	}

	onRecvActiveMsg(msg: Message) {
		this.recvActiveMsg = msg;
	}

	onAddSendMsg(msg: Message) {
		this.addSendMsg = msg;
		this.on比价();
	}

	async on比价() {
		try {
			const G比价 = new FangDongGroup(this.config.比价群uin);
			if (this.addSendMsg.peerUin === this.config.比价群uin) {
				console.log({
					addSendMsg: this.addSendMsg,
				});

				if (this.addSendMsg.textContent !== "#比价") {
					return;
				}

				const { records } = this.addSendMsg.qqMsg;
				const recordMsg = new Message(records);
				console.log("recordMsg", recordMsg);
				const mkText = recordMsg.markdownElementContent;
				const regions = mkText.split(" ---").slice(1);

				if (mkText.includes("账户房豆") && mkText.includes("剩余教义次数")) {
					const extractData = (region) => {
						const nameMatch = region.match(/\*\*区域(\d+)：/);
						const priceMatch = region.match(/地块目前单价(\d+)/);
						const todayMatch = region.match(/今日高低(\d+)\/(\d+)/);
						const historyMatch = region.match(/历史高低(\d+)\/(\d+)/);

						const currentPrice = priceMatch
							? parseInt(priceMatch[1], 10)
							: null;
						const todayLow = todayMatch ? parseInt(todayMatch[1], 10) : null;
						const historyLow = historyMatch
							? parseInt(historyMatch[1], 10)
							: null;

						return {
							nameMatch: nameMatch?.[0],
							currentPrice,
							todayLow,
							historyLow,
							todayDiff:
								currentPrice && todayLow ? todayLow - currentPrice : null,
							historyDiff:
								currentPrice && historyLow ? historyLow - currentPrice : null,
						};
					};

					const results = regions
						.map((region) => extractData(region))
						.filter((region) => region.currentPrice !== null);

					console.log(results);

					await sleep(1500);
					G比价.sendCmd(
						results
							.map((r) => {
								return `${r.nameMatch} 今日差额：${r.todayDiff}。历史差额：${r.historyDiff}`;
							})
							.join("\n"),
						false
					);
					return;
				}
				if (mkText.includes("你可卖的地块")) {
					const extractData = (region) => {
						const nameMatch = region.match(/\*\*区域(\d+)：/);
						const costMatch = region.match(/成本(\d+)/);
						const marketPriceMatch = region.match(/市场价(\d+)/);

						/** 成本 */
						const cost = costMatch ? parseInt(costMatch[1], 10) : null;
						/** 市场价 */
						const marketPrice = marketPriceMatch
							? parseInt(marketPriceMatch[1], 10)
							: null;

						return {
							nameMatch: nameMatch?.[0],
							cost,
							marketPrice,
							盈亏: Math.round(marketPrice * 0.95 - cost),
							// cost95: cost ? cost * 0.95 : null,
						};
					};

					const results = regions
						.map((region) => extractData(region))
						.filter((region) => region.cost !== null);

					console.log(results);

					await sleep(1500);
					G比价.sendCmd(
						results
							.map((r) => {
								return `${r.nameMatch} 盈亏：${r.盈亏}。`;
							})
							.join("\n"),
						false
					);
					return;
				}
			}
		} catch (error) {
			console.error(error);
		}
	}
}
