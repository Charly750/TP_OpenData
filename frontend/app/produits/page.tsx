"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/app/components/SearchBar";
import ProductCard from "@/app/components/ProductCard";
import { getProducts } from "@/app/lib/data";
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

		// Chargement des produits si authentifié
		const loadProducts = async () => {
			if (checkAuth()) {
				try {
					const data = await getProducts();
					setProducts(data);
					setFilteredProducts(data);
				} catch (error) {
					console.error(
						"Erreur lors du chargement des produits",
						error
					);
				} finally {
					setLoading(false);
				}
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
							<ProductCard key={product.id} product={product} />
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
