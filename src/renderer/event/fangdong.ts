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
		this.atcs = new At("2854207033", "u_GESJX5xcJFpWYIiPAVnXHQ");
	}

	sendCmd(msg: string) {
		const messageChain = new MessageChain();
		messageChain.append(this.at);
		messageChain.append(new PlainText(msg));
		this.sendMessage(messageChain);
	}
}

class FangDong extends BaseEvent {
	private config: ConfigType;
	private groups: Map<"招租", Group> = new Map();

	constructor(message: Message) {
		super(message);
		this.config = linPluginAPI.getConfigAll() as ConfigType;
		this.groups.set("招租", new Group(this.config.shuajiGroupId, message));
	}

	onRecvActiveMsg() {
		// 只接受房东人生bot消息
		if (this.message.senderUin === "2854207033") {
			console.log(this.message);
			if (this.config.招租Flag) {
				this.on招租();
			}
		}
	}

	private async setData(data) {
		const newData = { ...this.data, ...data };
		await linPluginAPI.setConfig("fangDongDataCache", newData);
	}

	private get data() {
		return linPluginAPI.getConfig("fangDongDataCache");
	}

	async on招租() {
		const G招租 = this.groups.get("招租");

		console.log(
			"this.textElementContent",
			this.isAtSelf,
			this.message.peerUin === this.config.招租群uin,
			this.config.招租群uin,
			this.textElementContent,
			this.markdownElementContent
		);
		if (this.isAtSelf && this.message.peerUin === this.config.招租群uin) {
			console.log(
				this.markdownElementContent.includes("租客确认了，快点签约吧"),
				this.markdownElementContent.includes("新租客来了，快点签约租客吧")
			);
			if (
				this.markdownElementContent.includes("租客确认了，快点签约吧") ||
				this.markdownElementContent.includes("新租客来了，快点签约租客吧")
			) {
				console.log("G招租", G招租);
				G招租.sendCmd(" 签约租客");
				await sleep(3000);
				G招租.sendCmd(" 招租客");
			}
		}
	}
}

export default FangDong;
