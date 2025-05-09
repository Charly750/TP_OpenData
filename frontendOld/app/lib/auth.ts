import { LoginResponse, RegisterResponse, UserData } from "../types";

// URL de base de l'API
const API_URL = "http://localhost:5000"; // Ajustez selon votre configuration

export const login = async (
	username: string,
	password: string
): Promise<LoginResponse> => {
	try {
		const response = await fetch(`${API_URL}/auth`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ username, password }),
		});

		const data = await response.json();

		if (response.ok && data.token) {
			// Stocker le token dans le localStorage
			localStorage.setItem("authToken", data.token);
			localStorage.setItem("isLoggedIn", "true");

			return {
				success: true,
				user: {
					username,
					token: data.token,
				},
			};
		}

		return {
			success: false,
			error: data.error || "Nom d'utilisateur ou mot de passe invalide",
		};
	} catch (error) {
		return {
			success: false,
			error: "Erreur de connexion au serveur",
		};
	}
};

export const register = async (
	userData: UserData
): Promise<RegisterResponse> => {
	try {
		const response = await fetch(`${API_URL}/register`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: userData.username,
				password: userData.password,
			}),
		});

		const data = await response.json();

		if (response.ok) {
			return {
				success: true,
				message: data.message || "Utilisateur enregistré avec succès",
			};
		}

		return {
			success: false,
			error: data.error || "Erreur lors de l'inscription",
		};
	} catch (error) {
		return {
			success: false,
			error: "Erreur de connexion au serveur",
		};
	}
};

export const logout = () => {
	// Nettoyer les données d'authentification
	localStorage.removeItem("authToken");
	localStorage.removeItem("isLoggedIn");
};

export const isAuthenticated = (): boolean => {
	return localStorage.getItem("isLoggedIn") === "true";
};

export const getAuthToken = (): string | null => {
	return localStorage.getItem("authToken");
};
