import { At, AtAll, Group, MessageChain, PlainText } from "../lib/euphony/src";
import Message from "./message";

class BaseEvent {
	message: Message;
	constructor(message: Message) {
		this.message = message;
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
}

export default BaseEvent;
