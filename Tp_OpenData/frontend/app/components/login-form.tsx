"use client";

import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardFooter } from "./ui/card";

export function LoginForm() {
	const [isLoading, setIsLoading] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch("http://localhost:5000/auth", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					username: email, // correspond à ton backend
					password: password,
				}),
			});

			const data = await response.json();

			if (response.ok) {
				localStorage.setItem("isAuthenticated", "true"); // ✅ connexion
				navigate("/dashboard");
			} else {
				setError(data.message || "Erreur d'authentification");
			}
		} catch (err) {
			setError("Erreur de connexion au serveur");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className="w-full bg-gray-800 border-0 text-white">
			<form onSubmit={handleSubmit}>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="username">Username</Label>
						<Input
							id="text"
							type="text"
							placeholder="username"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="bg-gray-700 text-white border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500" // Sans bordure visible, focus sur couleur à la mise au focus
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							className="bg-gray-700 text-white border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500" // Idem pour le mot de passe
						/>
					</div>
					{error && (
						<p className="text-sm font-medium text-red-500">
							{error}
						</p>
					)}
				</CardContent>
				<CardFooter className="flex flex-col mt-4">
					<Button
						type="submit"
						className="w-full bg-indigo-600 hover:bg-indigo-700"
						disabled={isLoading}
					>
						{isLoading ? (
							<>
								<svg
									className="mr-2 h-4 w-4 animate-spin"
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M21 12a9 9 0 1 1-6.219-8.56" />
								</svg>
								Connexion en cours...
							</>
						) : (
							"Se connecter"
						)}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
