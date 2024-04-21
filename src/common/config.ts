import _ from "lodash";

export type ConfigKey =
	| "shuajiFlag"
	| "bossFlag"
	| "shuajiGroupId"
	| "puGongGroupId"
	| "shuajiAutoUpgradeFlag"
	| "pugongAutoYaoFlag"
	| "yaoshuiCmd"
	| "autoChallengeFlag"
	| "challengeCmd";

class Config {
	private _config: any = {};
	constructor() {
		this._config = this.getBaseConfig();
		// 初始化默认配置，因为有些开关不能默认打开
		this.setBaseConfig(
			{
				shuajiFlag: false,
			},
			true
		);
		console.log("[LinPlugin info] >>> 配置文件读取成功");
		console.log("[LinPlugin info] >>> 配置：", this._config);
		// log.logger.info("配置读取成功");
	}

	private getBaseConfig(defaultConfig = {}) {
		return globalThis.LiteLoader.api.config.get("LinPlugin", defaultConfig);
	}

	private async setBaseConfig(config: any, init = false) {
		_.merge(this._config, config);
		if (!init) {
			await globalThis.LiteLoader.api.config.set(
				"LinPlugin",
				_.omit(this._config, ["shuajiFlag", "bossFlag"])
			);
		}
	}

	getConfig(key: ConfigKey) {
		return this._config[key] || null;
	}

	async setConfig(key: ConfigKey, value: any) {
		console.log({ key, value });
		this._config[key] = value;
		await this.setBaseConfig({ [key]: value });
	}
}

export default new Config();
