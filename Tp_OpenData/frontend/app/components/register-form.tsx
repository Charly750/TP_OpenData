"use client";

import type React from "react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // ✅ React Router
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "./ui/card";

export function RegisterForm() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate(); // ✅ React Router hook

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsLoading(true);
		setError(null);

		const formData = new FormData(event.currentTarget);
		const password = formData.get("password") as string;
		const confirmPassword = formData.get("confirmPassword") as string;

		if (password !== confirmPassword) {
			setError("Les mots de passe ne correspondent pas");
			setIsLoading(false);
			return;
		}

		// Simuler l'inscription
		setTimeout(() => {
			setIsLoading(false);
			navigate("/dashboard"); // ✅ redirection
		}, 1500);
	};

	return (
		<Card className="w-full auth-card fade-in">
			<CardHeader>
				<CardTitle>Créer un compte</CardTitle>
				<CardDescription>
					Inscrivez-vous pour accéder à votre tableau de bord
				</CardDescription>
			</CardHeader>
			<form onSubmit={handleSubmit}>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="firstName">Prénom</Label>
							<Input
								id="firstName"
								name="firstName"
								placeholder="Jean"
								className="custom-input"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="lastName">Nom</Label>
							<Input
								id="lastName"
								name="lastName"
								placeholder="Dupont"
								className="custom-input"
								required
							/>
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							name="email"
							type="email"
							placeholder="nom@exemple.com"
							className="custom-input"
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="password">Mot de passe</Label>
						<Input
							id="password"
							name="password"
							type="password"
							className="custom-input"
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="confirmPassword">
							Confirmer le mot de passe
						</Label>
						<Input
							id="confirmPassword"
							name="confirmPassword"
							type="password"
							className="custom-input"
							required
						/>
					</div>
					{error && (
						<p className="text-sm font-medium text-red-500">
							{error}
						</p>
					)}
				</CardContent>
				<CardFooter className="flex flex-col space-y-2">
					<Button
						type="submit"
						className="w-full"
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
								Inscription en cours...
							</>
						) : (
							"S'inscrire"
						)}
					</Button>
					<p className="mt-2 text-center text-sm text-gray-500">
						Vous avez déjà un compte ?{" "}
						<Link
							to="/login"
							className="font-medium text-primary hover:underline"
						>
							Connectez-vous
						</Link>
					</p>
				</CardFooter>
			</form>
		</Card>
	);
}
