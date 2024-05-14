export default class Timer {
	private timerId: NodeJS.Timeout | null;
	private startTime: number;
	private remainingTime: number;
	private callback: (() => void) | null;
	private isPaused: boolean;

	constructor() {
		this.timerId = null;
		this.startTime = 0;
		this.remainingTime = 0;
		this.callback = null;
		this.isPaused = false;
	}

	// 创建定时器
	create(duration: number, callback: () => void) {
		this.clear(); // 清除任何现有的定时器
		this.startTime = Date.now();
		this.remainingTime = duration;
		this.callback = callback;
		this.isPaused = false;

		this.timerId = setTimeout(() => {
			this.clear();
			if (typeof this.callback === "function") {
				this.callback();
			}
		}, duration);
	}

	// 清除定时器
	clear() {
		if (this.timerId !== null) {
			clearTimeout(this.timerId);
			this.timerId = null;
			this.startTime = 0;
			this.remainingTime = 0;
			this.callback = null;
			this.isPaused = false;
		}
	}

	// 获取剩余时间
	getRemainingTime(): number {
		if (this.timerId === null) {
			return 0;
		}
		if (this.isPaused) {
			return this.remainingTime;
		}
		return Math.max(0, this.remainingTime - (Date.now() - this.startTime));
	}

	// 暂停定时器
	pause() {
		if (this.timerId !== null && !this.isPaused) {
			this.remainingTime -= Date.now() - this.startTime;
			clearTimeout(this.timerId);
			this.timerId = null;
			this.isPaused = true;
		}
	}

	// 恢复定时器
	resume() {
		if (this.isPaused) {
			this.startTime = Date.now();
			this.timerId = setTimeout(() => {
				this.clear();
				if (typeof this.callback === "function") {
					this.callback();
				}
			}, this.remainingTime);
			this.isPaused = false;
		}
	}
}
