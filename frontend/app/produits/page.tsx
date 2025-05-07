"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/app/components/SearchBar";
import ProductCard from "@/app/components/ProductCard";
import { getProduct } from "@/app/lib/data";
import { Product } from "@/app//types";
import { logout } from "../lib/auth";

export default function Produits() {
	const router = useRouter();
	const [products, setProducts] = useState<Product[]>([]);
	const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		// Vérification côté client uniquement
		const checkAuth = () => {
			const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
			if (!isLoggedIn) {
				router.push("/");
				return false;
			}
			return true;
		};

		const loadProducts = async () => {
			if (checkAuth()) {
				try {
					const data = await getProduct({
						sort: "nutriscore_score",
						page: 1,
					});
					setProducts(data.products || []); // pour éviter un crash si `products` est undefined
					setFilteredProducts(data.products || []);
				} catch (error) {
					console.error(
						"Erreur lors du chargement des produits",
						error
					);
				} finally {
					setLoading(false);
				}
			} else {
				setLoading(false);
			}
		};

		loadProducts();
	}, [router]);

	const handleSearch = (term: string) => {
		setSearchTerm(term);
		if (term.trim() === "") {
			setFilteredProducts(products);
		} else {
			const filtered = products.filter((product) =>
				product.name.toLowerCase().includes(term.toLowerCase())
			);
			setFilteredProducts(filtered);
		}
	};

	const handleLogout = () => {
		logout();
		router.push("/");
	};
	console.log(
		"Exemple de produit :",
		JSON.stringify(filteredProducts[0], null, 2)
	);

	return (
		<div className="min-h-screen bg-gray-100">
			<div className="container mx-auto px-4 py-8">
				<div className="flex justify-between items-center mb-6">
					<h1 className="text-3xl font-bold">
						Produits alimentaires
					</h1>
					<button
						onClick={handleLogout}
						className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
					>
						Déconnexion
					</button>
				</div>

				<SearchBar searchTerm={searchTerm} onSearch={handleSearch} />

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
					{filteredProducts.length > 0 ? (
						filteredProducts.map((product) => (
							<div
								key={product.id}
								className="bg-white rounded-xl shadow-md overflow-hidden"
							>
								<img
									src={product.image_thumb_url}
									alt={product.product_name || "Produit"}
									className="w-full h-48 object-cover"
								/>
								<div className="p-4">
									<h3 className="text-lg font-semibold mb-1">
										{product.product_name}
									</h3>
									<p className="text-sm text-gray-700">
										Nutriscore : {product.nutrition_grades}
									</p>
									<p className="text-sm text-gray-700">
										Nova : {product.nova_group}
									</p>
									<p className="text-sm text-gray-700">
										Ecoscore : {product.ecoscore_grade}
									</p>
									<p className="text-sm text-gray-700">
										Magasin : {product.stores}
									</p>
									<div className="flex justify-between items-center mt-4">
										<a
											href={product.url}
											target="_blank"
											rel="noopener noreferrer"
											className="text-blue-600 hover:underline text-sm"
										>
											Détails
										</a>
									</div>
								</div>
							</div>
						))
					) : (
						<p className="text-gray-600 col-span-3 text-center py-8">
							Aucun produit trouvé.
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
