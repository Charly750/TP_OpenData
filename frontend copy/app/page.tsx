"use client"; // Utilisez cette directive si vous êtes en mode App Router

import { useState } from "react";
import { login } from "@/app/lib/auth"; // Ajustez le chemin selon votre structure
import { useRouter } from "next/navigation"; // Pour App Router
// import { useRouter } from 'next/router'; // Pour Pages Router (ancien Next.js)
import Link from "next/link";

export default function LoginPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Réinitialisation de l'erreur
		setError(null);

		// Validation basique des champs
		if (!username || !password) {
			setError("Tous les champs sont requis");
			return;
		}

		try {
			setLoading(true);

			// Appel de la fonction login
			const response = await login(username, password);

			// Traitement de la réponse
			if (response.success) {
				// Redirection vers la page d'accueil ou dashboard en cas de succès
				router.push("/produits");
			} else {
				// Affichage de l'erreur retournée par l'API
				setError(response.error || "Identifiants incorrects");
			}
		} catch (err) {
			setError("Erreur de connexion au serveur");
			console.error("Erreur lors de la connexion:", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			<div className="bg-white p-8 rounded-lg shadow-md w-96">
				<h1 className="text-2xl font-bold mb-6 text-center">
					Connexion
				</h1>

				{error && (
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit}>
					<div className="mb-4">
						<label
							className="block text-gray-700 text-sm font-bold mb-2"
							htmlFor="text"
						>
							Username
						</label>
						<input
							className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
							id="text"
							type="text"
							placeholder="Username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
						/>
					</div>

					<div className="mb-6">
						<label
							className="block text-gray-700 text-sm font-bold mb-2"
							htmlFor="password"
						>
							Mot de passe
						</label>
						<input
							className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
							id="password"
							type="password"
							placeholder="Mot de passe"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>

					<div className="flex items-center justify-between">
						<button
							className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
							type="submit"
						>
							Se connecter
						</button>
						<Link
							href="/inscription"
							className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
						>
							S'inscrire
						</Link>
					</div>
				</form>
			</div>
		</div>
	);
}
