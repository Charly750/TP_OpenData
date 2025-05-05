export const isAuthenticated = () =>
	localStorage.getItem("isAuthenticated") === "true";
