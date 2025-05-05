import Link from "next/link";
import { Button } from "./components/ui/button";

export default function Home() {
	return (
		<div className="flex min-h-screen flex-col bg-gray-900 text-white">
			<header className="w-full border-b border-gray-700">
				<div className="container flex h-16 items-center justify-between ml-4">
					<h1 className="text-xl font-bold text-white">
						Dashboard Management
					</h1>
				</div>
			</header>
			<main className="flex-1">
				<section
					className="flex justify-center w-full py-12 md:py-16 lg:py-24 
					bg-gradient-to-r from-violet-900 to-indigo-600 text-gray-100"
				>
					<div className="max-w-screen-xl mx-auto px-4 md:px-6">
						<div className="flex flex-col items-center justify-center space-y-8 text-center">
							<div className="space-y-4">
								<h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
									Gestion de Tableau de Bord
								</h1>
								<p className="mx-auto max-w-[700px] md:text-xl text-gray-300">
									Bienvenue sur notre plateforme de gestion de
									tableaux de bord. Connectez-vous ou
									inscrivez-vous pour commencer.
								</p>
							</div>
							<div className="flex flex-col sm:flex-row gap-4">
								<Button
									asChild
									size="lg"
									className="px-8 bg-gray-800/50 hover:bg-gray-800 text-white


	"
								>
									<Link href="/login">Se connecter</Link>
								</Button>
							</div>
						</div>
					</div>
				</section>

				<section className="flex justify-center w-full py-12 md:py-24 bg-gray-800/50">
					<div className="container px-4 md:px-6">
						<div className="grid gap-6 lg:grid-cols-3 items-start">
							<div className="space-y-2">
								<h3 className="text-xl font-bold text-white">
									Gestion de Données
								</h3>
								<p className="text-gray-400">
									Téléchargez et gérez facilement vos fichiers
									de données pour analyse.
								</p>
							</div>
							<div className="space-y-2">
								<h3 className="text-xl font-bold text-white">
									Visualisation
								</h3>
								<p className="text-gray-400">
									Créez et personnalisez des tableaux de bord
									interactifs avec Superset.
								</p>
							</div>
							<div className="space-y-2">
								<h3 className="text-xl font-bold text-white">
									Collaboration
								</h3>
								<p className="text-gray-400">
									Partagez vos analyses et travaillez en
									équipe sur vos projets de données.
								</p>
							</div>
						</div>
					</div>
				</section>
			</main>

			<footer className="border-t border-gray-700 flex justify-center py-6">
				<div className="container px-4 md:px-6">
					<p className="text-center text-sm text-gray-400">
						© 2023 Dashboard Management. Tous droits réservés.
					</p>
				</div>
			</footer>
		</div>
	);
}
