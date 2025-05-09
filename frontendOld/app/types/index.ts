export interface Product {
	id: number;
	name: string;
	description: string;
	nutriScore: "A" | "B" | "C" | "D" | "E";
	novaScore: "1" | "2" | "3" | "4" | "5";
	greenScore: "A" | "B" | "C" | "D" | "E";
}

export interface UserData {
	username: string;
	password: string;
}

export interface LoginResponse {
	success: boolean;
	user?: {
		username: string;
		token: string;
	};
	error?: string;
}

export interface RegisterResponse {
	success: boolean;
	message?: string;
	error?: string;
}
