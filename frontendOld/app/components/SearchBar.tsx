import { ChangeEvent } from "react";

interface SearchBarProps {
	searchTerm: string;
	onSearch: (term: string) => void;
}

export default function SearchBar({ searchTerm, onSearch }: SearchBarProps) {
	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		onSearch(e.target.value);
	};

	return (
		<div className="w-full">
			<div className="relative">
				<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
					<svg
						className="w-5 h-5 text-gray-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						></path>
					</svg>
				</div>
				<input
					type="search"
					className="block w-full p-4 pl-10 text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
					placeholder="Rechercher un produit..."
					value={searchTerm}
					onChange={handleChange}
				/>
			</div>
		</div>
	);
}
