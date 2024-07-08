import _ from "lodash";

/**
 * 配置项类型
 */
export interface ConfigType {
	/** 你的云国uid */
	yunGuoUid: any;
	/** 是否自动刷级 */
	shuajiFlag: any;
	/** 是否自动boss */
	bossFlag: any;
	/** 刷级群号 */
	shuajiGroupId: any;
	/** 普攻群号 */
	puGongGroupId: any;
	/** 刷级是否自动升级 */
	shuajiAutoUpgradeFlag: any;
	/** 普攻是否自动吃药 */
	pugongAutoYaoFlag: any;
	/** 药水命令 */
	yaoshuiCmd: any;
	/** 是否定时自动发起挑战 */
	autoChallengeFlag: any;
	/** 挑战命令 */
	challengeCmd: any;
	/** 是否自动发车 */
	autoFaCheFlag: any;
	/** 发车命令 */
	faCheCmd: any;
	/** 是否自动跟车 */
	自动跟车Flag: any;
	/** 车群 */
	cheGroupId: any;
	/** 纯粹的普攻 */
	chunCuiPuGong: any;
	/** 云国数据缓存 */
	yunGuoDataCache: any;
	/** 掉水自动续车 */
	diaoShuiAutoFaCheFlag: any;
	/** 持续合成群号 */
	cxhcGroupId: any;
	/** 续车指令 */
	xuCheCmd: any;
	/** 是否持续合成 */
	cxhcFlag: boolean;
	/** 副本是否使用技能 */
	fubenSkillFlag: boolean;
	/** 副本技能ID */
	fubenSkillId: any;
	/** 副本技能所需点数 */
	fubenPointsRequiredForSkills: any;
	/** 是否持续卡本 */
	kabenFlag: any;
	/** 卡本群号 */
	kabenGroupId: any;
	/** 是否持续抽卡 */
	choukaFlag: boolean;
	/** 是否持续喝水 */
	hsFlag: boolean;
	/** 喝神奇水命令 */
	hscmd: any;
	/** 持续抽卡/喝水群号 */
	choukaGroupId: any;
	/** 是否持续攻楼 */
	gonglouFlag: boolean;
	/** 持续攻楼群号 */
	gonglouGroupId: any;
	/** 灵宠 */
	LCFlag: boolean;
	/** 灵宠群号 */
	LCGroupId: any;
	/** 分解圣物 */
	FJFlag: boolean;
	/** 分解群号 */
	FJGroupId: any;
	/** 分解指令 */
	FJCmd: any;
	/** 散财 */
	HUAQIANFlag: boolean;
	/** 散财群号 */
	HUAQIANGroupId: any;
	定时指令Flag: boolean;
	定时指令群: any;
	定时指令间隔: number;
	定时指令: string;
	自定义回执Flag: boolean;
	自定义回执群: any;
	自定义回执关键词: string;
	自定义回执回复指令: string;
	自定义回执间隔: number;
	自动合成Flag: boolean;
	自动合成_装备id: any;
	自动合成_胚子: any;
	自动合成_剩余合成卡: number;
	/** 自动挑战 */
	tzFlag: boolean;
	/** 挑战群号 */
	tzGroupId: any;
	/** 挑战指令 */
	tzCmd: any;
	/** 送花 */
	// songhuaFlag: boolean;
	/** 送花群号 */
	// songhuaGroupId: any;
	/** 开始送花ID */
	// songhuaksCmd: any;
	/** 结束送花ID */
	// songhuajsCmd: any;
	跟车群: any;
	跟车间隔: number;
	跟车次序: number;
	发车时间: number;
	/** 傀儡开关 */
	kuilieFlag: any;
	/** 傀儡QQ */
	klQQ: any;
	/** 傀儡权限人QQ */
	klqxqq: any;
	/** 傀儡信息敏感词 */
	klmgc: any;
	自动出售_Flag: boolean;
	自动出售_群: any;
	自动出售_物品名称: any;
	自动分解_Flag: boolean;
	自动分解_群: any;
	自动分解_主词条数值: number;
	打怪指令Flag: boolean;
	打怪指令群: any;
	打怪指令间隔: number;
	打怪指令: string;
	闭关Flag: boolean;
	闭关群: any;
	闭关间隔: number;
	其他指令群: any;
	监控人ID: any;
	监控信息内容一: any;
	延迟Flag一: boolean;
	延迟时间一: number;
	回复信息内容一: any;
	循环Flag一: boolean;
	执行回复Flag一: boolean;
	监控信息内容二: any;
	延迟Flag二: boolean;
	延迟时间二: number;
	回复信息内容二: any;
	循环Flag二: boolean;
	执行回复Flag二: boolean;
	监控信息内容三: any;
	延迟Flag三: boolean;
	延迟时间三: number;
	回复信息内容三: any;
	循环Flag三: boolean;
	执行回复Flag三: boolean;
}

class Config {
	private srcConfigs: { [key: string]: ConfigType } = {};
	private _config: ConfigType = {} as ConfigType;
	private selfUin: string;

	constructor() {}

	init(selfUin) {
		console.log("[LinPlugin info] >>> selfUin: ", selfUin);
		this.selfUin = selfUin;
		this.srcConfigs = globalThis.LiteLoader.api.config.get("LinPlugin", {});
		const selfConfig = this.srcConfigs[selfUin] ?? ({} as ConfigType);
		this._config = selfConfig;
		console.log("[LinPlugin info] >>> 初始化配置成功: ", selfConfig);
	}

	private async setBaseConfig(config: any) {
		this.srcConfigs[this.selfUin] ??= _.merge(
			{},
			this.srcConfigs[this.selfUin],
			config
		);
		await globalThis.LiteLoader.api.config.set("LinPlugin", this.srcConfigs);
	}

	get config() {
		return this._config;
	}

	getConfig(key: keyof ConfigType) {
		return this._config[key] || null;
	}

	async setConfig(key: keyof ConfigType, value: any) {
		console.log("[LinPlugin info] >>> 设置配置: ", { key, value });
		(this._config[key] as any) = value;
		await this.setBaseConfig({ [key]: value });
	}
}

export default new Config();
