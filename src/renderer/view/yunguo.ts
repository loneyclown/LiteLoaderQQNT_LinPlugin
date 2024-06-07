import { getInputValue } from "../utils";

const linPluginAPI = window.linPluginAPI;
const pluginLog = linPluginAPI.pluginLog;

/** 初始化云国脚本设置块 */
const initYunguoSettingView = async (view: Element) => {
	view.querySelectorAll(".yunguo setting-switch[key]").forEach((item) => {
		pluginLog("item-getAttribute", item.getAttribute("key"));
		const flag = linPluginAPI.getConfig(item.getAttribute("key") as any);
		if (flag !== null) {
			item.toggleAttribute("is-active", flag);
		}
		item.addEventListener("click", async () => {
			const isActive = item.hasAttribute("is-active");
			await linPluginAPI.setConfig(item.getAttribute("key") as any, !isActive);
			item.toggleAttribute("is-active", !isActive);
		});
	});

	view
		.querySelectorAll(".yunguo input[key]")
		.forEach((item: HTMLInputElement) => {
			item.value = linPluginAPI.getConfig(item.getAttribute("key") as any);
			item.addEventListener("blur", async (e: Event) => {
				await linPluginAPI.setConfig(
					item.getAttribute("key") as any,
					(e.target as HTMLInputElement).value
				);
			});
		});

	view
		.querySelector("#重置自动合成背包页码")
		.addEventListener("click", async () => {
			const newData = {
				...linPluginAPI.getConfig("yunGuoDataCache"),
				自动合成_背包页码: 1,
			};
			await linPluginAPI.setConfig("yunGuoDataCache", newData);
			alert("重置成功");
		});

	view
		.querySelector("#自动出售_重置背包页码")
		.addEventListener("click", async () => {
			const newData = {
				...linPluginAPI.getConfig("yunGuoDataCache"),
				自动出售_背包页码: 1,
			};
			await linPluginAPI.setConfig("yunGuoDataCache", newData);
			alert("重置成功");
		});
};

export default initYunguoSettingView;
