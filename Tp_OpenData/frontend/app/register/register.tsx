import { RegisterForm } from "../components/register-form";

export default function Register() {
	return (
		<div className="flex min-h-screen flex-col">
			<main className="flex-1">
				<section className="w-full py-12 md:py-24 lg:py-32">
					<div className="container px-4 md:px-6">
						<div className="flex flex-col items-center justify-center space-y-4 text-center">
							<div className="space-y-2">
								<h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
									Créer un compte
								</h1>
								<p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
									Inscrivez-vous pour accéder à votre tableau
									de bord et gérer vos données
								</p>
							</div>
							<div className="w-full max-w-md space-y-2">
								<RegisterForm />
							</div>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
