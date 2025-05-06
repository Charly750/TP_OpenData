import { LoginResponse, RegisterResponse, UserData } from "../types";

export const login = async (
	email: string,
	password: string
): Promise<LoginResponse> => {
	// Simulation d'une requête API
	await new Promise((resolve) => setTimeout(resolve, 500));

	// Exemple simple à des fins de démonstration uniquement
	if (email === "user@example.com" && password === "password") {
		return { success: true, user: { email, name: "Utilisateur Test" } };
	}

	return { success: false, error: "Email ou mot de passe incorrect" };
};

export const register = async (
	userData: UserData
): Promise<RegisterResponse> => {
	// Simulation d'une requête API
	await new Promise((resolve) => setTimeout(resolve, 500));

	// Dans une application réelle, vous enregistreriez l'utilisateur dans votre base de données
	return { success: true };
};

export const logout = () => {
	// Nettoyer les données d'authentification
	localStorage.removeItem("isLoggedIn");
};
