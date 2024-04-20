import winston from "winston";

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
			defaultMeta: { service: "user-service" },
			transports: [
				//
				// - Write all logs with importance level of `error` or less to `error.log`
				// - Write all logs with importance level of `info` or less to `combined.log`
				//
				// new winston.transports.File({ filename: "error.log", level: "error" }),
				// new winston.transports.File({ filename: "combined.log" }),
				new winston.transports.Console({
					format: winston.format.combine(
						winston.format.label({ label: "Lin-Plugin" }),
						winston.format.timestamp(),
						winston.format.printf(
							({ level, message, label, timestamp, tag }) => {
								return `>>> ${timestamp} [${label}] ${level} [${tag}] >>>: ${message}`;
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
