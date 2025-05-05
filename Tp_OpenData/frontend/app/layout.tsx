import type React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Button } from "./components/ui/button";
import { Link } from "react-router";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Dashboard Management",
	description: "Plateforme de gestion de tableaux de bord",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// Determine if we're on the home page
	const isHomePage = true; // This is a simplification - in a real app you'd check the current route

	// If we're on the home page, show the home content, otherwise show the children
	const content = isHomePage ? (
		<div className="flex min-h-screen flex-col">
			<header className="w-full border-b">
				<div className="container flex h-16 items-center justify-between py-4">
					<h1 className="text-xl font-bold">Dashboard Management</h1>
				</div>
			</header>
			<main className="flex-1">
				<section className="w-full py-12 md:py-24 lg:py-32 gradient-bg text-white">
					<div className="container px-4 md:px-6">
						<div className="flex flex-col items-center justify-center space-y-8 text-center">
							<div className="space-y-4">
								<h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
									Gestion de Tableau de Bord
								</h1>
								<p className="mx-auto max-w-[700px] md:text-xl">
									Bienvenue sur notre plateforme de gestion de
									tableaux de bord. Connectez-vous ou
									inscrivez-vous pour commencer.
								</p>
							</div>
							<div className="flex flex-col sm:flex-row gap-4">
								<Button asChild size="lg" className="px-8">
									<Link to="/login">Se Connecter</Link>
								</Button>
								<Button
									asChild
									variant="outline"
									size="lg"
									className="px-8 bg-white/10 hover:bg-white/20 text-white"
								>
									<Link to="/register">S'inscrire'</Link>
								</Button>
							</div>
						</div>
					</div>
				</section>

				<section className="w-full py-12 md:py-24 bg-muted/50">
					<div className="container px-4 md:px-6">
						<div className="grid gap-6 lg:grid-cols-3 items-start">
							<div className="space-y-2">
								<h3 className="text-xl font-bold">
									Gestion de Données
								</h3>
								<p className="text-gray-500">
									Téléchargez et gérez facilement vos fichiers
									de données pour analyse.
								</p>
							</div>
							<div className="space-y-2">
								<h3 className="text-xl font-bold">
									Visualisation
								</h3>
								<p className="text-gray-500">
									Créez et personnalisez des tableaux de bord
									interactifs avec Superset.
								</p>
							</div>
							<div className="space-y-2">
								<h3 className="text-xl font-bold">
									Collaboration
								</h3>
								<p className="text-gray-500">
									Partagez vos analyses et travaillez en
									équipe sur vos projets de données.
								</p>
							</div>
						</div>
					</div>
				</section>
			</main>

			<footer className="border-t py-6">
				<div className="container px-4 md:px-6">
					<p className="text-center text-sm text-gray-500">
						© 2023 Dashboard Management. Tous droits réservés.
					</p>
				</div>
			</footer>
		</div>
	) : (
		children
	);

	return (
		<html lang="fr">
			<body className={inter.className}>{content}</body>
		</html>
	);
}
