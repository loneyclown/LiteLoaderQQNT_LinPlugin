export const setInputValue = (
	view: Element,
	selector: string,
	value: string
) => {
	const input = view.querySelector(selector) as HTMLInputElement;
	input.value = value;
};

export const getInputValue = (view: Element, selector: string) => {
	const input = view.querySelector(selector) as HTMLInputElement;
	return input.value;
};
