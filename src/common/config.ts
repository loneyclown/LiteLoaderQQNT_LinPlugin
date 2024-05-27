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
	跟车群: any;
	跟车间隔: number;
	跟车次序: number;
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
