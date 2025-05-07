"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/app/components/SearchBar";
import { getProduct } from "@/app/lib/data";
import { Product } from "@/app/types";
import { logout } from "../lib/auth";
import BarcodeScannerModal from "../barcode-scanner/page";
import ScanbotSDKService from "./../services/scanbot-sdk-service";

export default function Produits() {
	const router = useRouter();
	const [products, setProducts] = useState<Product[]>([]);
	const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [searchType, setSearchType] = useState<string>("category"); // Nouveau : type de recherche
	const [filterNutriscore, setFilterNutriscore] = useState<string>("all");
	const [loading, setLoading] = useState<boolean>(true);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [totalPages, setTotalPages] = useState<number>(1);
	const [isScannerOpen, setScannerOpen] = useState(false);
	const [scannedCode, setScannedCode] = useState<string | null>(null);
	useEffect(() => {
		

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
					setLoading(true);
					const data = await getProduct({
						sort: "nutriscore_score",
						page: currentPage,
					});
					setProducts(data.products || []);
					setFilteredProducts(data.products || []);
					if (data.pagination) {
						setTotalPages(data.pagination);
					}
				} catch (error) {
					console.error("Erreur lors du chargement des produits", error);
				} finally {
					setLoading(false);
				}
			} else {
				setLoading(false);
			}
		};

		if (searchTerm.trim() === "") {
			loadProducts();
		}
	}, [router, currentPage, searchTerm]);

	useEffect(() => {
		const fetchSearchResults = async () => {
			if (searchTerm.trim() === "") return;

			setLoading(true);
			try {
				const token = localStorage.getItem("authToken");
				const response = await fetch(
					`http://localhost:5000/search/${searchType}/${encodeURIComponent(searchTerm)}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);
				if (!response.ok) throw new Error("Erreur recherche");

				const data = await response.json();
				setProducts(data.products || []);
				setFilteredProducts(data.products || []);
				setTotalPages(1);
			} catch (error) {
				console.error("Erreur recherche : ", error);
				setProducts([]);
				setFilteredProducts([]);
			} finally {
				setLoading(false);
			}
		};

		if (searchTerm.trim() !== "") {
			fetchSearchResults();
		}
	}, [searchTerm, searchType]);

	useEffect(() => {
		let result = [...products];

		if (filterNutriscore !== "all") {
			result = result.filter(
				(product) => product.nutrition_grades === filterNutriscore
			);
		}

		setFilteredProducts(result);
	}, [filterNutriscore, products]);

	const handleSearch = (term: string) => {
		setSearchTerm(term);
		setCurrentPage(1);
	};

	const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setFilterNutriscore(event.target.value);
	};

	const handleSearchTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setSearchType(event.target.value);
		setSearchTerm(""); // réinitialise la recherche courante
	};

	const handleLogout = () => {
		logout();
		router.push("/");
	};

	const renderPageNumbers = () => {
		if (totalPages <= 1) return null;

		const pages = [];
		const maxPagesToShow = 5;
		let start = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
		let end = Math.min(totalPages, start + maxPagesToShow - 1);

		if (end - start < maxPagesToShow - 1) {
			start = Math.max(1, end - maxPagesToShow + 1);
		}

		for (let i = start; i <= end; i++) {
			pages.push(
				<button
					key={i}
					onClick={() => setCurrentPage(i)}
					className={`px-3 py-1 rounded ${currentPage === i
						? "bg-blue-600 text-white font-semibold"
						: "bg-white text-blue-600 border border-blue-500"
						}`}
				>
					{i}
				</button>
			);
		}

		return pages;
	};

	return (
		<div className="min-h-screen bg-gray-100">
			<div className="container mx-auto px-4 py-8">
				<div className="flex justify-between items-center mb-6">
					<h1 className="text-3xl font-bold">Produits alimentaires</h1>
					<button
						onClick={handleLogout}
						className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
					>
						Déconnexion
					</button>
				</div>
				<div>
      <button onClick={() => setScannerOpen(true)}>Ouvrir le scanner</button>

      {scannedCode && <p>Résultat : {scannedCode}</p>}

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={(result) => {
			console.log("je suis ici")
          setScannedCode(result);
		  console.log("Scanned code: ", result);
          // Autre logique métier ici
        }}
      />
    </div>
				{/* Recherche et filtre */}
				<div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-6">
					<div className="w-full md:w-1/3 mb-4 md:mb-0">
						<SearchBar onSearch={handleSearch} />
					</div>



					{/* Select : Recherche par */}
					<div className="w-full md:w-1/4 mb-4 md:mb-0">
						<label className="block mb-1 text-sm font-medium text-gray-700">
							Recherche par
						</label>
						<select
							value={searchType}
							onChange={handleSearchTypeChange}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						>
							<option value="category">Par Catégorie</option>
							<option value="brand">Par Marque</option>
						</select>
					</div>

					{/* Select : Nutriscore */}
					<div className="w-full md:w-1/4">
						<label className="block mb-1 text-sm font-medium text-gray-700">
							Nutriscore
						</label>
						<select
							value={filterNutriscore}
							onChange={handleFilterChange}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						>
							<option value="all">Tous les Nutriscores</option>
							<option value="a">Nutriscore A</option>
							<option value="b">Nutriscore B</option>
							<option value="c">Nutriscore C</option>
							<option value="d">Nutriscore D</option>
							<option value="e">Nutriscore E</option>
						</select>
					</div>




				</div>

				{/* Grille produits */}
				{loading ? (
					<p className="text-center text-gray-600">Chargement...</p>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
				)}

				{/* Pagination */}
				{searchTerm.trim() === "" && totalPages > 1 && (
					<div className="flex flex-wrap justify-center items-center mt-8 gap-2">
						<button
							onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
							disabled={currentPage === 1}
							className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
						>
							Précédent
						</button>

						{renderPageNumbers()}

						<button
							onClick={() =>
								setCurrentPage((prev) =>
									totalPages && prev < totalPages ? prev + 1 : prev
								)
							}
							disabled={currentPage >= totalPages}
							className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
						>
							Suivant
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
