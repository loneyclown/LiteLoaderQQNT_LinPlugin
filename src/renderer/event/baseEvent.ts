import { At, AtAll, Group, MessageChain, PlainText } from "../lib/euphony/src";
import Message from "./message";
const linPluginAPI = window.linPluginAPI;

class BaseEvent {
	message: Message;
	globalData: GlobalData;
	constructor(message: Message) {
		this.message = message;
		this.globalData = linPluginAPI.getGlobalData();
	}

	async sendMessage() {}

	async sendGroupMessage(group: Group, text: string, at?: At | AtAll) {
		const messageChain = new MessageChain();
		if (at) {
			messageChain.append(at);
		}
		messageChain.append(new PlainText(text));
		group.sendMessage(messageChain);
	}

	get markdownElementContent() {
		const e14 = this.message.elements.filter((e) => e.elementType === 14);
		const { markdownElement } = e14?.[0];
		return markdownElement?.content;
	}

	get isAtSelf() {
		return (
			this.markdownElementContent.includes(
				`at_tinyid=${this.globalData.selfUin}`
			) || this.textElementAtNtUid === this.globalData.selfUid
		);
	}

	get textElementAtNtUid() {
		const arr = this.message.elements.filter((e) => e.elementType === 1);
		const find = arr.find((e) => e.textElement.atNtUid);
		return find?.textElement.atNtUid;
	}

	get atType() {
		return this.message.qqMsg.atType;
	}

	get textElementContent() {
		const e1 = this.message.elements.filter(
			(e) =>
				e.elementType === 1 &&
				e.textElement.atType === 0 &&
				e.textElement.content !== " "
		);
		const find = e1.find((e) => e.textElement.content);
		return find?.textElement.content;
	}
}

export default BaseEvent;
