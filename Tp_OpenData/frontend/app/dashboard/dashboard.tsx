import { FileUpload } from "../components/file-upload";
import { SupersetButton } from "../components/superset-button";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";

export default function Dashboard() {
	const navigate = useNavigate();

	const handleLogout = () => {
		localStorage.removeItem("isAuthenticated");
		navigate("/"); // Redirige vers la page d'accueil
	};

	return (
		<div className="flex min-h-screen flex-col bg-gray-900 text-white">
			<header className="sticky top-0 z-10 w-full border-b border-gray-700 bg-gray-800">
				<div className="flex items-center justify-between h-16 mx-4">
					<h1 className="text-xl font-bold text-white">
						Dashboard Management
					</h1>
					<Button
						className="flex justify-self-end"
						variant="outline"
						size="sm"
						asChild
						onClick={handleLogout}
					>
						Log out
					</Button>
				</div>
			</header>
			<main className="flex-1 bg-gray-800">
				<div className="container py-6 md:py-12">
					<div className="flex justify-between gap-6">
						<div className="space-y-4 w-full max-w-md mx-auto">
							<h2 className="text-2xl font-bold text-white">
								Upload Files
							</h2>
							<p className="text-gray-400">
								Upload your data files to be processed and
								visualized in your dashboard
							</p>
							<FileUpload />
						</div>
						<div className="space-y-4">
							<h2 className="text-2xl font-bold text-white">
								Dashboard Visualization
							</h2>
							<p className="text-gray-400">
								Access Superset to visualize and modify your
								dashboards
							</p>
							<SupersetButton />
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
