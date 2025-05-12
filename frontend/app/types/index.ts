export interface Product {
	id: string;
	product_name: string;
	brand: string;
	description: string;
	image_url: string;
	nutrition_grades: string;
	nova_group: number;
	ecoscore_grade: string;
	quantity: string;
	ingredients: string;
	allergens: string;
	stores: string;
	origin: string;
	labels: string[]; // tableau de chaînes
	nutriscore_image: string;
	url: string;
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

export interface NutrientInfo {
	name: string;
	value: string;
	unit: string;
	level: "low" | "medium" | "high"; // optionnel : tu peux le restreindre
}
