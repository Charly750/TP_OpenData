import { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "App Nutri-Score",
	description:
		"Application pour consulter les scores nutritionnels des produits",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="fr">
			<body>{children}</body>
		</html>
	);
}
