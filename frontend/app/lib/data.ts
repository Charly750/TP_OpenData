import { Product } from "../types";

// Données fictives pour simuler une API
const productsData: Product[] = [
	{
		id: 1,
		name: "Yaourt Nature Bio",
		description: "Yaourt nature biologique sans sucre ajouté",
		nutriScore: "A",
		novaScore: "1",
		greenScore: "A",
	},
	{
		id: 2,
		name: "Pain Complet",
		description: "Pain complet aux céréales",
		nutriScore: "B",
		novaScore: "1",
		greenScore: "B",
	},
	{
		id: 3,
		name: "Jus d'Orange",
		description: "Jus d'orange pressé 100% pur jus",
		nutriScore: "C",
		novaScore: "2",
		greenScore: "B",
	},
	{
		id: 4,
		name: "Biscuits au Chocolat",
		description: "Biscuits avec pépites de chocolat",
		nutriScore: "D",
		novaScore: "4",
		greenScore: "C",
	},
	{
		id: 5,
		name: "Pizza Surgelée",
		description: "Pizza 4 fromages surgelée",
		nutriScore: "D",
		novaScore: "4",
		greenScore: "D",
	},
	{
		id: 6,
		name: "Soda Cola",
		description: "Boisson gazeuse sucrée",
		nutriScore: "E",
		novaScore: "4",
		greenScore: "E",
	},
	{
		id: 7,
		name: "Salade Composée",
		description: "Salade fraîche avec légumes de saison",
		nutriScore: "A",
		novaScore: "1",
		greenScore: "A",
	},
	{
		id: 8,
		name: "Chips nature",
		description: "Chips de pommes de terre à l'huile de tournesol",
		nutriScore: "D",
		novaScore: "4",
		greenScore: "D",
	},
	{
		id: 9,
		name: "Pâtes complètes",
		description: "Pâtes alimentaires complètes",
		nutriScore: "A",
		novaScore: "1",
		greenScore: "B",
	},
];

// Fonction pour simuler une requête API
export const getProducts = async (): Promise<Product[]> => {
	// Simulation d'un délai de réseau
	await new Promise((resolve) => setTimeout(resolve, 500));
	return productsData;
};
