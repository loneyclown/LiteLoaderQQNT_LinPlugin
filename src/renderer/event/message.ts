export interface NtQQMsg {
	anonymousExtInfo: any;
	atType: number;
	avatarFlag: number;
	avatarMeta: string;
	avatarPendant: string;
	categoryManage: number;
	channelId: string;
	channelName: string;
	chatType: number;
	clientIdentityInfo: any;
	clientSeq: string;
	cntSeq: string;
	commentCnt: string;
	directMsgFlag: number;
	directMsgMembers: any[];
	editable: false;
	elements: NtQQMessageElement[];
	emojiLikesList: any[];
	extInfoForUI: any;
	feedId: string;
	fileGroupSize: any;
	foldingInfo: any;
	freqLimitInfo: any;
	fromAppid: string;
	fromChannelRoleInfo: {};
	fromGuildRoleInfo: {};
	fromUid: string;
	generalFlags: string;
	guildCode: string;
	guildId: string;
	guildName: string;
	isImportMsg: false;
	isOnlineMsg: true;
	levelRoleInfo: {};
	msgAttrs: {};
	msgEventInfo: any;
	msgId: string;
	msgMeta: string;
	msgRandom: string;
	msgSeq: string;
	msgTime: string;
	msgType: number;
	multiTransInfo: any;
	nameType: number;
	peerName: string;
	peerUid: string;
	peerUin: string;
	personalMedal: any;
	recallTime: string;
	records: any[];
	roleId: string;
	roleType: number;
	sendMemberName: string;
	sendNickName: string;
	sendRemarkName: string;
	sendStatus: number;
	sendType: number;
	senderUid: string;
	senderUin: string;
	subMsgType: any;
	timeStamp: string;
}
export interface NtQQMessageElement {
	elementType: number;
	textElement: NtQQMessageTextElement;
	markdownElement: NtQQMessageMarkdownElement;
	inlineKeyboardElement: NtQQMessageInlineKeyboardElement;
}
export interface NtQQMessageTextElement {
	atChannelId: string;
	atNtUid: string;
	atRoleColor: number;
	atRoleId: string;
	atRoleName: string;
	atTinyId: string;
	atType: number;
	atUid: string;
	content: string;
	linkInfo: any;
	needNotify: number;
	subElementType: number;
}
export interface NtQQMessageMarkdownElement {
	content: string;
}
export interface NtQQMessageInlineKeyboardElement {
	botAppid: string;
	rows: Array<{ buttons: NtQQMessageInlineKeyboardButton[] }>;
}

export interface NtQQMessageInlineKeyboardButton {
	anchor: number;
	atBotShowChannelList: boolean;
	clickLimit: number;
	data: string;
	enter: boolean;
	feedBackData: any;
	id: string;
	isReply: boolean;
	label: string;
	permissionType: number;
	specifyRoleIds: any[];
	specifyTinyids: any[];
	style: number;
	subscribeDataTemplateIds: any[];
	type: number;
	unsupportTips: string;
	visitedLabel: string;
}

const linPluginAPI = window.linPluginAPI;
const pluginLog = linPluginAPI.pluginLog;

class Message {
	messages: NtQQMsg[];
	qqMsg: NtQQMsg;
	globalData: GlobalData;

	constructor(messages: NtQQMsg[] = [] as NtQQMsg[]) {
		this.messages = messages;
		this.qqMsg = messages?.[0] ?? ({} as NtQQMsg);
		this.globalData = linPluginAPI.getGlobalData();
	}

	findButton(label: string) {
		return this.buttons.find((btn) => btn.label === label);
	}

	get peerUid() {
		return this.qqMsg.peerUid;
	}

	get peerUin() {
		return this.qqMsg.peerUin;
	}

	get senderUid() {
		return this.qqMsg.senderUid;
	}

	get senderUin() {
		return this.qqMsg.senderUin;
	}

	get elements() {
		return this.qqMsg.elements;
	}

	get textContent() {
		return this.elements
			.map((e) =>
				e.textElement ? e.textElement.content : e.markdownElement?.content
			)
			.join("");
	}

	get buttons() {
		const ele = this.elements.find((e) => e.elementType === 17);
		if (ele) {
			const arr: NtQQMessageInlineKeyboardButton[] = [];
			ele.inlineKeyboardElement.rows.forEach((row) => {
				row.buttons.forEach((btn) => {
					arr.push(btn);
				});
			});
			return arr;
		}
		return [];
	}

	get markdownElementContent() {
		const e14 = this.elements.filter((e) => e.elementType === 14);
		const { markdownElement } = e14?.[0];
		return markdownElement?.content;
	}

	get textElementAtNtUid() {
		const arr = this.elements.filter((e) => e.elementType === 1);
		const find = arr.find((e) => e.textElement.atNtUid);
		return find?.textElement.atNtUid;
	}

	get isAtSelf() {
		return (
			this.markdownElementContent.includes(
				`at_tinyid=${this.globalData.selfUin}`
			) || this.textElementAtNtUid === this.globalData.selfUid
		);
	}

	get noAtTextElementContent() {
		const e1 = this.elements.filter(
			(e) => e.elementType === 1 && e.textElement.atType === 0
		);
		return e1.map((e) => e.textElement.content).join("");
	}
}

export default Message;
