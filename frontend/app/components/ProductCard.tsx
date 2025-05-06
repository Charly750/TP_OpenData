import { Product } from "../types";

interface ProductCardProps {
	product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
	// Fonction pour déterminer la couleur du badge en fonction du score
	const getBadgeColor = (score: string): string => {
		const scoreMap: Record<string, string> = {
			A: "bg-green-500",
			B: "bg-green-300",
			C: "bg-yellow-400",
			D: "bg-orange-400",
			E: "bg-red-500",
			"1": "bg-green-500",
			"2": "bg-green-300",
			"3": "bg-yellow-400",
			"4": "bg-orange-400",
			"5": "bg-red-500",
		};

		return scoreMap[score] || "bg-gray-400";
	};

	return (
		<div className="bg-white rounded-lg shadow-md overflow-hidden">
			<div className="p-4">
				<h2 className="text-xl font-bold mb-2">{product.name}</h2>

				<div className="grid grid-cols-3 gap-2 mb-4">
					<div className="flex flex-col items-center">
						<span className="text-sm text-gray-600 mb-1">
							Nutri-Score
						</span>
						<span
							className={`px-3 py-1 rounded-full text-white font-bold ${getBadgeColor(
								product.nutriScore
							)}`}
						>
							{product.nutriScore}
						</span>
					</div>

					<div className="flex flex-col items-center">
						<span className="text-sm text-gray-600 mb-1">
							Nova Score
						</span>
						<span
							className={`px-3 py-1 rounded-full text-white font-bold ${getBadgeColor(
								product.novaScore
							)}`}
						>
							{product.novaScore}
						</span>
					</div>

					<div className="flex flex-col items-center">
						<span className="text-sm text-gray-600 mb-1">
							Green Score
						</span>
						<span
							className={`px-3 py-1 rounded-full text-white font-bold ${getBadgeColor(
								product.greenScore
							)}`}
						>
							{product.greenScore}
						</span>
					</div>
				</div>

				<div className="text-sm text-gray-600">
					<p>{product.description}</p>
				</div>
			</div>
		</div>
	);
}
