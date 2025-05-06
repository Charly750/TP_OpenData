export interface Product {
	id: number;
	name: string;
	description: string;
	nutriScore: "A" | "B" | "C" | "D" | "E";
	novaScore: "1" | "2" | "3" | "4" | "5";
	greenScore: "A" | "B" | "C" | "D" | "E";
}

export interface UserData {
	email: string;
	nom: string;
	prenom: string;
	password: string;
}

export interface LoginResponse {
	success: boolean;
	user?: {
		email: string;
		name: string;
	};
	error?: string;
}

export interface RegisterResponse {
	success: boolean;
	error?: string;
}
