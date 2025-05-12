"use client";

import { useState } from "react";
import {
	ArrowLeft,
	Heart,
	Truck,
	Shield,
	Leaf,
	ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useParams } from "next/navigation";
import { useEffect } from "react";

interface NutrientInfo {
	name: string;
	value: string;
	unit: string;
	level: "low" | "medium" | "high";
}

export default function ProductDetail() {
	const [quantity, setQuantity] = useState(1);

	const { id } = useParams();
	const [product, setProduct] = useState(null);
	const [nutrients, setNutrients] = useState([]);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);

	const [recommended, setRecommended] = useState([]);

	useEffect(() => {
		if (!product?.categories_tags || product.categories_tags.length < 2)
			return;

		const categoryTag =
			product.categories_tags[product.categories_tags.length - 2];

		const fetchRecommended = async () => {
			try {
				const res = await fetch(
					`http://localhost:5000/product/recommendation?category=${encodeURIComponent(
						categoryTag
					)}`
				);
				const data = await res.json();
				setRecommended(data.slice(0, 4)); // limite à 4 produits
			} catch (err) {
				console.error(
					"Erreur lors du chargement des recommandations :",
					err
				);
			}
		};

		fetchRecommended();
	}, [product]);

	useEffect(() => {
		fetch(`https://world.openfoodfacts.org/api/v2/product/${id}`)
			.then((res) => {
				if (!res.ok) throw new Error("Produit introuvable");
				return res.json();
			})
			.then((data) => {
				if (!data.product) throw new Error("Données manquantes");
				const p = data.product;

				setProduct({
					id: p.code,
					product_name: p.product_name_fr || p.product_name,
					brand: p.brands,
					description: p.generic_name_fr || p.generic_name || "",
					image_url: p.image_url,
					nutrition_grades: p.nutrition_grades,
					nova_group: p.nova_group,
					ecoscore_grade: p.ecoscore_grade,
					quantity: p.quantity,
					ingredients: p.ingredients_text_fr || p.ingredients_text,
					allergens: p.allergens_tags?.join(", ").replace("en:", ""),
					stores: p.stores,
					origin: p.origins,
					labels: p.labels_tags?.map((l) => l.replace("en:", "")),
					nutriscore_image: p.nutriscore_image_url,
					url: p.url,
				});

				const nutriments = p.nutriments || {};
				const nutrientList = [
					{
						name: "Énergie",
						value: nutriments["energy-kcal_100g"],
						unit: "kcal",
					},
					{
						name: "Matières grasses",
						value: nutriments["fat_100g"],
						unit: "g",
					},
					{
						name: "Acides gras saturés",
						value: nutriments["saturated-fat_100g"],
						unit: "g",
					},
					{
						name: "Glucides",
						value: nutriments["carbohydrates_100g"],
						unit: "g",
					},
					{
						name: "Sucres",
						value: nutriments["sugars_100g"],
						unit: "g",
					},
					{
						name: "Protéines",
						value: nutriments["proteins_100g"],
						unit: "g",
					},
					{ name: "Sel", value: nutriments["salt_100g"], unit: "g" },
					{
						name: "Fibres",
						value: nutriments["fiber_100g"],
						unit: "g",
					},
				].filter((n) => n.value !== undefined);

				setNutrients(nutrientList);
				setLoading(false);
			})
			.catch((err) => {
				setError(err.message);
				setLoading(false);
			});
	}, [id]);

	if (loading) return <p>Chargement...</p>;
	if (error) return <p>Erreur : {error}</p>;

	const getNutriscoreColor = (grade: string) => {
		const grades: Record<string, string> = {
			a: "bg-green-600",
			b: "bg-light-green-600",
			c: "bg-yellow-600",
			d: "bg-orange-600",
			e: "bg-red-600",
		};
		return grades[grade?.toLowerCase()] || "bg-gray-400";
	};

	const getNutrientLevelColor = (level: string) => {
		const levels: Record<string, string> = {
			low: "bg-green-100 text-green-800",
			medium: "bg-yellow-100 text-yellow-800",
			high: "bg-red-100 text-red-800",
		};
		return levels[level] || "bg-gray-100 text-gray-800";
	};

	const incrementQuantity = () => setQuantity((prev) => prev + 1);
	const decrementQuantity = () =>
		setQuantity((prev) => Math.max(1, prev - 1));

	return (
		<div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
			<div className="container mx-auto px-4 py-8">
				{/* Navigation */}
				<div className="mb-6">
					<button
						className="flex items-center text-emerald-700 hover:text-emerald-800 font-medium"
						onClick={() => window.history.back()}
					>
						<ArrowLeft size={18} className="mr-2" />
						Retour aux produits
					</button>
				</div>

				{/* Product Header */}
				<div className="grid md:grid-cols-2 gap-8 mb-10">
					{/* Product Image */}
					<div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 p-4">
						<div className="relative">
							<img
								src={product.image_url || "/placeholder.svg"}
								alt={product.product_name}
								className="w-full h-auto object-contain rounded-lg mx-auto"
								style={{ maxHeight: "400px" }}
							/>
							<div className="absolute top-3 right-3">
								<span
									className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-white font-bold ${getNutriscoreColor(
										product.nutrition_grades
									)}`}
								>
									{product.nutrition_grades?.toUpperCase()}
								</span>
							</div>
						</div>

						<div className="mt-4 flex justify-center">
							<img
								src={
									product.nutriscore_image ||
									"/placeholder.svg"
								}
								alt="Nutriscore"
								className="h-10 object-contain"
							/>
						</div>
					</div>

					{/* Product Info */}
					<div className="flex flex-col">
						<div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-4 flex-grow">
							<div className="mb-2">
								{product.labels.map((label) => (
									<Badge
										key={label}
										variant="outline"
										className="mr-2 bg-emerald-50 text-emerald-700 border-emerald-200"
									>
										{label}
									</Badge>
								))}
							</div>

							<h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
								{product.product_name}
							</h1>
							<p className="text-emerald-700 font-medium mb-4">
								{product.brand}
							</p>

							<div className="grid grid-cols-2 gap-3 mb-6">
								<div className="bg-gray-50 p-3 rounded-lg">
									<p className="text-xs text-gray-500">
										Nova
									</p>
									<p className="text-sm font-medium">
										{product.nova_group || "N/A"}
									</p>
								</div>
								<div className="bg-gray-50 p-3 rounded-lg">
									<p className="text-xs text-gray-500">
										Ecoscore
									</p>
									<p className="text-sm font-medium">
										{product.ecoscore_grade?.toUpperCase() ||
											"N/A"}
									</p>
								</div>
								<div className="bg-gray-50 p-3 rounded-lg">
									<p className="text-xs text-gray-500">
										Quantité
									</p>
									<p className="text-sm font-medium">
										{product.quantity}
									</p>
								</div>
								<div className="bg-gray-50 p-3 rounded-lg">
									<p className="text-xs text-gray-500">
										Origine
									</p>
									<p className="text-sm font-medium">
										{product.origin}
									</p>
								</div>
							</div>

							<p className="text-gray-600 mb-6">
								{product.description}
							</p>

							<div className="mb-6">
								{/* Espace intentionnellement laissé vide pour maintenir la mise en page */}
							</div>

							<div className="flex flex-col sm:flex-row gap-3">
								<Button
									variant="outline"
									className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
								>
									<Heart className="mr-2 h-4 w-4" />
									Favoris
								</Button>
							</div>
						</div>

						<div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
							{product.stores && (
								<div className="flex items-center mb-2">
									<Truck className="h-4 w-4 text-emerald-600 mr-2" />
									<p className="text-sm text-gray-700">
										Disponible chez:{" "}
										<span className="font-medium">
											{product.stores}
										</span>
									</p>
								</div>
							)}
							<div className="flex items-center">
								<Shield className="h-4 w-4 text-emerald-600 mr-2" />
								<p className="text-sm text-gray-700">
									Garantie qualité et fraîcheur
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Product Details Tabs */}
				<div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-10">
					<Tabs defaultValue="nutrition">
						<TabsList className="grid grid-cols-3 mb-6">
							<TabsTrigger value="nutrition">
								Nutrition
							</TabsTrigger>
							<TabsTrigger value="ingredients">
								Ingrédients
							</TabsTrigger>
							<TabsTrigger value="info">Informations</TabsTrigger>
						</TabsList>

						<TabsContent value="nutrition" className="space-y-4">
							<h3 className="text-lg font-semibold text-gray-800 mb-4">
								Valeurs nutritionnelles
							</h3>
							<p className="text-sm text-gray-600 mb-4">
								Pour 100g de produit
							</p>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{nutrients.map((nutrient) => (
									<div
										key={nutrient.name}
										className="flex items-center justify-between p-3 border border-gray-100 rounded-lg"
									>
										<span className="text-gray-700">
											{nutrient.name}
										</span>
										<div className="flex items-center">
											<span className="font-medium mr-2">
												{nutrient.value}
												{nutrient.unit}
											</span>
											<span
												className={`text-xs px-2 py-1 rounded-full ${getNutrientLevelColor(
													nutrient.level
												)}`}
											>
												{nutrient.level === "low"
													? "Faible"
													: nutrient.level ===
													  "medium"
													? "Moyen"
													: "Élevé"}
											</span>
										</div>
									</div>
								))}
							</div>
						</TabsContent>

						<TabsContent value="ingredients">
							<h3 className="text-lg font-semibold text-gray-800 mb-4">
								Liste des ingrédients
							</h3>
							<p className="text-gray-700 mb-6">
								{product.ingredients}
							</p>

							{product.allergens && (
								<div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-4">
									<h4 className="font-medium text-red-700 mb-1">
										Allergènes
									</h4>
									<p className="text-red-600">
										{product.allergens}
									</p>
								</div>
							)}

							<div className="flex items-center text-emerald-700 mt-4">
								<Leaf className="h-5 w-5 mr-2" />
								<p className="font-medium">
									Produit issu de l'agriculture biologique
								</p>
							</div>
						</TabsContent>

						<TabsContent value="info">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<h3 className="text-lg font-semibold text-gray-800 mb-4">
										Informations produit
									</h3>
									<div className="space-y-3">
										<div className="flex justify-between border-b border-gray-100 pb-2">
											<span className="text-gray-600">
												Marque
											</span>
											<span className="font-medium text-gray-800">
												{product.brand}
											</span>
										</div>
										<div className="flex justify-between border-b border-gray-100 pb-2">
											<span className="text-gray-600">
												Origine
											</span>
											<span className="font-medium text-gray-800">
												{product.origin}
											</span>
										</div>
										<div className="flex justify-between border-b border-gray-100 pb-2">
											<span className="text-gray-600">
												Quantité
											</span>
											<span className="font-medium text-gray-800">
												{product.quantity}
											</span>
										</div>
										<div className="flex justify-between border-b border-gray-100 pb-2">
											<span className="text-gray-600">
												Nutriscore
											</span>
											<span className="font-medium text-gray-800">
												{product.nutrition_grades.toUpperCase()}
											</span>
										</div>
										<div className="flex justify-between border-b border-gray-100 pb-2">
											<span className="text-gray-600">
												Nova
											</span>
											<span className="font-medium text-gray-800">
												{product.nova_group}
											</span>
										</div>
										<div className="flex justify-between pb-2">
											<span className="text-gray-600">
												Ecoscore
											</span>
											<span className="font-medium text-gray-800">
												{product.ecoscore_grade.toUpperCase()}
											</span>
										</div>
									</div>
								</div>

								<div>
									<h3 className="text-lg font-semibold text-gray-800 mb-4">
										Conservation
									</h3>
									<p className="text-gray-700 mb-6">
										À conserver au réfrigérateur entre 0°C
										et 4°C. À consommer de préférence avant
										la date indiquée sur l'emballage.
									</p>

									<h3 className="text-lg font-semibold text-gray-800 mb-4">
										Labels et certifications
									</h3>
									<div className="flex flex-wrap gap-2">
										{product.labels.map((label) => (
											<Badge
												key={label}
												className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
											>
												{label}
											</Badge>
										))}
									</div>
								</div>
							</div>

							<div className="mt-8 pt-6 border-t border-gray-100">
								<a
									href={product.url}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center text-emerald-600 hover:text-emerald-700 font-medium"
								>
									<ExternalLink size={16} className="mr-2" />
									Voir plus d'informations sur ce produit
								</a>
							</div>
						</TabsContent>
					</Tabs>
				</div>

				{/* Recommended Products */}
				<div className="mb-10">
					<h2 className="text-2xl font-bold text-emerald-800 mb-6">
						Produits similaires
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
						{[1, 2, 3, 4].map((item) => (
							<div
								key={item}
								className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all hover:shadow-lg"
							>
								<div className="relative h-48 overflow-hidden">
									<img
										src="/placeholder.svg?height=300&width=300"
										alt="Produit similaire"
										className="w-full h-full object-cover transition-transform hover:scale-105"
									/>
									<div className="absolute top-3 right-3">
										<span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold bg-green-600">
											A
										</span>
									</div>
								</div>
								<div className="p-4">
									<h3 className="text-lg font-semibold mb-2 text-gray-800 line-clamp-1">
										Yaourt Bio Nature
									</h3>
									<p className="text-sm text-gray-600 mb-3 line-clamp-2">
										Yaourt onctueux au lait entier de vaches
										nourries à l'herbe
									</p>
									<p className="text-sm text-emerald-700">
										Nature & Saveurs
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
