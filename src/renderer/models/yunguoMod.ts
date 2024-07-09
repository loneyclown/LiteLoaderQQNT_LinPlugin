import { ConfigType } from "../../common/config";
import { sleep } from "../../common/utils";
import Message from "../event/message";
import { At, Group, MessageChain, PlainText } from "../lib/euphony/src";

class YunGroup extends Group {
	private at: At;
	groupId: any;

	constructor(groupId: any) {
		super(groupId);
		this.groupId = groupId;
		this.at = new At("2854200865", "u_FY-uEFafkeFr4we_Y7mdEA");
	}

	sendCmd(msg: string, isAt = true) {
		const messageChain = new MessageChain();
		isAt && messageChain.append(this.at);
		messageChain.append(new PlainText(msg));
		this.sendMessage(messageChain);
	}
}

export default class YunguoMod {
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
		await window.linPluginAPI.setConfig("yunGuoDataCache", newData);
	}

	private get data() {
		return window.linPluginAPI.getConfig("yunGuoDataCache");
	}

	onRecvActiveMsg(msg: Message) {
		this.recvActiveMsg = msg;
		// 持续合成
		if (this.config.cxhcFlag) {
			this.on持续合成();
		}
	}

	onAddSendMsg(msg: Message) {
		this.addSendMsg = msg;
		// 持续合成
		if (this.config.cxhcFlag) {
			this.on持续合成(false);
		}
	}

	/**
	 *
	 * @param isRecvActive 是否为回复
	 */
	async on持续合成(isRecvActive = true) {
		const G合成 = new YunGroup(this.config.cxhcGroupId);

		if (isRecvActive) {
			if (this.recvActiveMsg.peerUin === this.config.cxhcGroupId) {
				const { new_持续合成_temp_cmd } = this.data;
				if (
					new_持续合成_temp_cmd &&
					this.recvActiveMsg.markdownElementContent.includes(
						"合成失败，不要气馁"
					)
				) {
					await sleep(1500);
					G合成.sendCmd(new_持续合成_temp_cmd);
				}
			}
		} else {
			if (this.addSendMsg.peerUin === this.config.cxhcGroupId) {
				if (this.addSendMsg.qqMsg.atType === 2) {
					const match =
						this.addSendMsg.textContent.match(/\s*确定合成(\d+):(\d+)/);
					if (match) {
						this.setData({
							new_持续合成_temp_cmd: this.addSendMsg.noAtTextElementContent,
						});
					}
				}
			}
		}
	}
}
