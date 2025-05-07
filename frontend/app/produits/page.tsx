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
	const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
	const [loadingPage, setLoadingPage] = useState<boolean>(false);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [totalPages, setTotalPages] = useState<number>(1);

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
					setLoadingPage(true);
					const data = await getProduct({
						sort: "nutriscore_score",
						page: currentPage,
					});
					setProducts(data.products || []); // pour éviter un crash si `products` est undefined
					setFilteredProducts(data.products || []);

					// Mise à jour du nombre total de pages
					if (data.pagination) {
						// La pagination est envoyée directement comme un nombre entier
						setTotalPages(data.pagination);
					}
				} catch (error) {
					console.error(
						"Erreur lors du chargement des produits",
						error
					);
				} finally {
					setLoadingPage(false);
					setIsInitialLoad(false);
				}
			} else {
				setIsInitialLoad(false);
			}
		};

		loadProducts();
	}, [router, currentPage]);

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

	// Charger les produits de la page actuelle
	const handlePageChange = (page: number) => {
		if (page >= 1 && page <= totalPages && page !== currentPage) {
			setCurrentPage(page);
			window.scrollTo(0, 0); // Remonter en haut de la page
			// Remettre à zéro la recherche lors du changement de page
			setSearchTerm("");
		}
	};

	// Générer un tableau de pages à afficher (max 5 pages autour de la page courante)
	const getPaginationRange = () => {
		const range = [];
		const maxPagesToShow = 5;

		let startPage = Math.max(
			1,
			currentPage - Math.floor(maxPagesToShow / 2)
		);
		let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

		// Ajuster startPage si on est près de la fin
		if (endPage - startPage + 1 < maxPagesToShow) {
			startPage = Math.max(1, endPage - maxPagesToShow + 1);
		}

		for (let i = startPage; i <= endPage; i++) {
			range.push(i);
		}

		return range;
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

				{isInitialLoad ? (
					<div className="flex flex-col justify-center items-center py-12 h-64">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
						<p className="text-gray-600">
							Chargement initial des produits...
						</p>
					</div>
				) : (
					<>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
							{loadingPage ? (
								// Afficher des cartes squelettes pendant le chargement de la page
								Array(9)
									.fill(0)
									.map((_, index) => (
										<div
											key={index}
											className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse"
										>
											<div className="w-full h-48 bg-gray-300"></div>
											<div className="p-4">
												<div className="h-5 bg-gray-300 rounded w-3/4 mb-3"></div>
												<div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
												<div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
												<div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
												<div className="h-4 bg-gray-300 rounded w-1/3 mt-4"></div>
											</div>
										</div>
									))
							) : filteredProducts.length > 0 ? (
								filteredProducts.map((product) => (
									<div
										key={product.id}
										className="bg-white rounded-xl shadow-md overflow-hidden"
									>
										<img
											src={product.image_thumb_url}
											alt={
												product.product_name ||
												"Produit"
											}
											className="w-full h-48 object-cover"
										/>
										<div className="p-4">
											<h3 className="text-lg font-semibold mb-1">
												{product.product_name}
											</h3>
											<p className="text-sm text-gray-700">
												Nutriscore :{" "}
												{product.nutrition_grades}
											</p>
											<p className="text-sm text-gray-700">
												Nova : {product.nova_group}
											</p>
											<p className="text-sm text-gray-700">
												Ecoscore :{" "}
												{product.ecoscore_grade}
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

						{/* Pagination */}
						{totalPages > 1 && (
							<div className="flex justify-center items-center mt-8 mb-8">
								<nav className="flex flex-wrap items-center space-x-1 md:space-x-2">
									<button
										onClick={() =>
											handlePageChange(currentPage - 1)
										}
										disabled={
											currentPage === 1 || loadingPage
										}
										className={`px-3 py-1 rounded-md ${
											currentPage === 1 || loadingPage
												? "bg-gray-200 text-gray-500 cursor-not-allowed"
												: "bg-gray-200 text-gray-700 hover:bg-gray-300"
										}`}
									>
										&laquo;
									</button>

									{getPaginationRange().map((page) => (
										<button
											key={page}
											onClick={() =>
												handlePageChange(page)
											}
											disabled={loadingPage}
											className={`px-3 py-1 rounded-md ${
												currentPage === page
													? "bg-blue-500 text-white"
													: loadingPage
													? "bg-gray-200 text-gray-500 cursor-not-allowed"
													: "bg-gray-200 text-gray-700 hover:bg-gray-300"
											}`}
										>
											{page}
										</button>
									))}

									<button
										onClick={() =>
											handlePageChange(currentPage + 1)
										}
										disabled={
											currentPage === totalPages ||
											loadingPage
										}
										className={`px-3 py-1 rounded-md ${
											currentPage === totalPages ||
											loadingPage
												? "bg-gray-200 text-gray-500 cursor-not-allowed"
												: "bg-gray-200 text-gray-700 hover:bg-gray-300"
										}`}
									>
										&raquo;
									</button>

									{loadingPage && (
										<span className="ml-2 text-sm text-gray-600 flex items-center">
											<div className="w-4 h-4 border-2 border-gray-400 border-t-blue-500 rounded-full animate-spin mr-2"></div>
											Chargement...
										</span>
									)}
								</nav>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
