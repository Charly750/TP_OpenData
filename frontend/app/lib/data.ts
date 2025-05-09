interface ProductQuery {
	sort?: string;
	page?: number;
}

export const getProduct = async ({
	sort = "popularity_key",
	page = 1,
}: ProductQuery) => {
	try {
		const token = localStorage.getItem("authToken"); // ou AsyncStorage.getItem pour React Native

		const response = await fetch("http://localhost:5000/product/list", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ sort, page }),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw errorData;
		}

		const data = await response.json();
		console.log(data);
		return data;
	} catch (error) {
		console.error("Erreur lors de la récupération des produits :", error);
		throw error;
	}
};
