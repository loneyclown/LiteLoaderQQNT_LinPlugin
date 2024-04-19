// @ts-ignore
import StyleRaw from "./style.css?raw";

const sleep = (time: number) =>
	new Promise((resolve) => setTimeout(resolve, time));

const sendMessage = async (
	message: string,
	groupId: string = "724297426",
	option: { isAtCw?: boolean } = {}
) => {
	const { isAtCw = true } = option;
	const group = new window.euphony.Group(groupId);
	return new Promise((resolve, reject) => {
		if (isAtCw) {
			const cwUid = window.linPluginAPI.getLinUid("2854200865") ?? null;
			if (!cwUid) {
				alert("未检测到草王UID");
				reject();
			}
			const at = new window.euphony.At("2854200865", cwUid);
			const messageChain = new window.euphony.MessageChain();
			messageChain.append(at).append(new window.euphony.PlainText(message));
			group.sendMessage(messageChain);
			resolve(null);
		}
	});
};

// 打开设置界面触发
export const onSettingWindowCreated = async (view: Element) => {
	let shuaJiFlag = false;
	let puGongFlag = false;

	const htmlText = `
		<div>
			<h1>设置界面</h1>
			<p>这里可以修改设置</p>

			<div>
				<div class="item">
					<div class="btns">
						<button id="shuaJi">刷级</button>
						<button id="shuaJiStop">停止刷级</button>
					</div>
					<div class="input-wrap">
						<div></div>
						刷级群: <input id="shuaJiGroupId" value="724297426" />
					</div>
				</div>

				<div class="item">
					<div class="btns">
						<button id="puGong">普攻</button>
						<button id="puGongStop">停止普攻</button>
					</div>
					<div class="input-wrap">
						普攻群: <input id="puGongGroupId" value="724297426" />
					</div>
				</div>
			</div>
		</div>
	`;

	view.insertAdjacentHTML("afterbegin", `<style>${StyleRaw}</style>`);
	view.insertAdjacentHTML("afterbegin", htmlText);

	const shuajiLoop = async (groupId: string) => {
		if (shuaJiFlag) {
			await sleep(1000);
			await sendMessage(" 简单游历", groupId);
			await sleep(5000);
			await sendMessage(" 云国战斗", groupId);
			await sleep(5000);
			await sendMessage(" 确定战斗", groupId);
			await sleep(5000);
			await sendMessage(" 云国战斗", groupId);
			await sleep(5000);
			await sendMessage(" 确定战斗", groupId);

			setTimeout(() => shuajiLoop(groupId), 60 * 1000);
		}
	};

	const puGongLoop = async (groupId: string) => {
		if (puGongFlag) {
			await sleep(1000);
			await sendMessage(" 普攻", groupId);

			setTimeout(() => puGongLoop(groupId), 2 * 1000);
		}
	};

	view.querySelector("#shuaJi").addEventListener("click", async () => {
		try {
			alert("开始刷级");
			const groupId = (view.querySelector("#shuaJiGroupId") as HTMLInputElement)
				.value;
			shuaJiFlag = true;
			shuajiLoop(groupId);
		} catch (error) {
			console.log("error", error);
			alert(error.toString());
		}
	});
	view.querySelector("#shuaJiStop").addEventListener("click", async () => {
		alert("停止刷级");
		shuaJiFlag = false;
	});

	view.querySelector("#puGong").addEventListener("click", async () => {
		try {
			alert("开始普攻");
			const groupId = (view.querySelector("#puGongGroupId") as HTMLInputElement)
				.value;
			puGongFlag = true;
			puGongLoop(groupId);
		} catch (error) {
			console.log("error", error);
			alert(error.toString());
		}
	});
	view.querySelector("#puGongStop").addEventListener("click", async () => {
		alert("停止普攻");
		puGongFlag = false;
	});
};
