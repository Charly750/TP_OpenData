import { LoginForm } from "../components/login-form";

export default function Login() {
	return (
		<div className="flex min-h-screen flex-col bg-gray-900">
			{" "}
			{/* Fond sombre général */}
			<main className="flex-1 flex justify-center items-center py-12 md:py-24 lg:py-32 bg-gray-900">
				<div className=" max-w-screen-sm w-full bg-gray-800 p-8 rounded-lg shadow-lg">
					{/* Card container */}
					<div className="flex-col flex items-center justify-center  text-white space-y-6">
						<h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
							Connexion
						</h1>
						<p className="text-center text-gray-400 md:text-xl">
							Connectez-vous pour accéder à votre tableau de bord
							et gérer vos données.
						</p>
						<div className="w-full max-w-sm space-y-4">
							<LoginForm />
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
