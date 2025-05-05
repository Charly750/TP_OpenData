"use client";

import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { BarChart3 } from "lucide-react";

export function SupersetButton() {
	const handleRedirectToSuperset = () => {
		// Remplace par ton URL réelle de Superset
		window.open("http://localhost:8089/superset/welcome/");
	};

	return (
		<Card className="border-0 bg-gray-800 hover:bg-gray-700 rounded-lg">
			<CardContent className="p-6">
				<div className="space-y-4">
					<div className="flex flex-col items-center justify-center h-32 bg-gray-700 dark:bg-gray-800 rounded-lg">
						<BarChart3 className="w-12 h-12 mb-2 text-white" />
						<p className="text-sm text-gray-400 dark:text-gray-300">
							Visualize and modify your dashboards
						</p>
					</div>
					<Button
						onClick={handleRedirectToSuperset}
						className="w-full bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-800 dark:text-gray-200 dark:hover:bg-indigo-700 rounded-md py-3"
					>
						Open Superset Dashboard
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
