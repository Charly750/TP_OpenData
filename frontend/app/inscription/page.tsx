"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserData } from "../types";
import { register } from "@/app/lib/auth"; // Ajustez le chemin selon votre structure

export default function Inscription() {
	const router = useRouter();
	const [username, setUsername] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [confirmPassword, setConfirmPassword] = useState<string>("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Réinitialisation de l'erreur
		setError(null);

		// Validation basique des champs
		if (!username || !password) {
			setError("Tous les champs sont requis");
			return;
		}

		// Vérification que les mots de passe correspondent
		if (password !== confirmPassword) {
			setError("Les mots de passe ne correspondent pas");
			return;
		}

		try {
			setLoading(true);

			// Préparation des données utilisateur
			const userData: UserData = {
				username,
				password,
			};

			// Appel de la fonction register
			const response = await register(userData);

			// Traitement de la réponse
			if (response.success) {
				// Redirection vers la page de connexion en cas de succès
				// Vous pouvez aussi utiliser une notification toast ici
				alert(
					"Inscription réussie! Vous pouvez maintenant vous connecter."
				);
				router.push("/");
			} else {
				// Affichage de l'erreur retournée par l'API
				setError(
					response.error ||
						"Une erreur est survenue lors de l'inscription"
				);
			}
		} catch (err) {
			setError("Erreur de connexion au serveur");
			console.error("Erreur lors de l'inscription:", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			<div className="bg-white p-8 rounded-lg shadow-md w-96">
				<h1 className="text-2xl font-bold mb-6 text-center">
					Inscription
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

					<div className="mb-4">
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

					<div className="mb-6">
						<label
							className="block text-gray-700 text-sm font-bold mb-2"
							htmlFor="confirmPassword"
						>
							Confirmer le mot de passe
						</label>
						<input
							className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
							id="confirmPassword"
							type="password"
							placeholder="Confirmer le mot de passe"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							required
						/>
					</div>

					<div className="flex items-center justify-between">
						<button
							className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
							type="submit"
						>
							S'inscrire
						</button>
						<Link
							href="/"
							className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
						>
							Retour à la connexion
						</Link>
					</div>
				</form>
			</div>
		</div>
	);
}
