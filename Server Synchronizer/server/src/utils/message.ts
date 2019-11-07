export const generateMessage = (from, text) => {
	return {
		from,
		text,
		createdAt: new Date().toLocaleTimeString()
	};
};
