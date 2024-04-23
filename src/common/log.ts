import winston from "winston";
import { SPLAT } from "triple-beam";

class Log {
	logger = null;

	constructor() {
		const pluginPath = globalThis.LiteLoader.plugins.LinPlugin.path.plugin;
		const logger = winston.createLogger({
			level: "info",
			format: winston.format.combine(
				winston.format.timestamp(), // adds a timestamp property
				winston.format.json()
			),
			defaultMeta: { service: "Lin-Plugin" },
			transports: [
				new winston.transports.Console({
					format: winston.format.combine(
						winston.format.colorize(),
						winston.format.printf(
							({ service, message, level, label, timestamp, ...rest }) => {
								return `[${service}-${level}${
									label ? `-${label}` : ""
								}] >>> ${message}`;
							}
						)
					),
				}),
				new winston.transports.File({
					filename: `${pluginPath}/info.log`,
					level: "info",
				}),
			],
		});

		this.logger = logger;
		logger.info("日志模块加载完成");
	}

	info(tag: string = "", message: any) {
		this.logger.log({
			tag,
			level: "info",
			message,
		});
	}

	error(tag: string = "", message: any) {
		this.logger.error({
			tag,
			level: "error",
			message,
		});
	}
}

export default new Log();
