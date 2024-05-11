import _ from "lodash";

export enum CONFIG_KEY {
	/** 你的云国uid */
	yunGuoUid = "yunGuoUid",
	/** 是否自动刷级 */
	shuajiFlag = "shuajiFlag",
	/** 是否自动boss */
	bossFlag = "bossFlag",
	/** 刷级群号 */
	shuajiGroupId = "shuajiGroupId",
	/** 普攻群号 */
	puGongGroupId = "puGongGroupId",
	/** 刷级是否自动升级 */
	shuajiAutoUpgradeFlag = "shuajiAutoUpgradeFlag",
	/** 普攻是否自动吃药 */
	pugongAutoYaoFlag = "pugongAutoYaoFlag",
	/** 药水命令 */
	yaoshuiCmd = "yaoshuiCmd",
	/** 是否定时自动发起挑战 */
	autoChallengeFlag = "autoChallengeFlag",
	/** 挑战命令 */
	challengeCmd = "challengeCmd",
	/** 是否自动发车 */
	autoFaCheFlag = "autoFaCheFlag",
	/** 发车命令 */
	faCheCmd = "faCheCmd",
	/**是否自动跟车 */
	autoGenCheFlag = "autoGenCheFlag",
	/** 车群 */
	cheGroupId = "cheGroupId",
	/** 纯粹的普攻 */
	chunCuiPuGong = "chunCuiPuGong",
	/** 云国数据缓存 */
	yunGuoDataCache = "yunGuoDataCache",
	/** 掉水自动续车 */
	diaoShuiAutoFaCheFlag = "diaoShuiAutoFaCheFlag",
	/** 持续合成群号 */
	cxhcGroupId = "cxhcGroupId",
	/** 续车指令 */
	xuCheCmd = "xuCheCmd",
}

export type ConfigType = {
	[key in CONFIG_KEY]: any;
};

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

	getConfig(key: CONFIG_KEY) {
		return this._config[key] || null;
	}

	async setConfig(key: CONFIG_KEY, value: any) {
		console.log("[LinPlugin info] >>> 设置配置: ", { key, value });
		this._config[key] = value;
		await this.setBaseConfig({ [key]: value });
	}
}

export default new Config();
