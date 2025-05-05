import { type ChangeEvent, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import { Upload } from "lucide-react";
import { Label } from "./label";

export function FileUpload() {
	const [file, setFile] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [fileUploaded, setFileUploaded] = useState("");
	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files[0]) {
			setFile(event.target.files[0]);
		}
	};

	const handleUpload = async () => {
		if (!file) return;

		setIsUploading(true);
		setUploadProgress(0);

		// Lire le contenu du fichier et le parser
		const reader = new FileReader();
		reader.onload = async (event) => {
			const text = event.target?.result as string;

			try {
				const jsonData = JSON.parse(text); // si fichier .json
				// const jsonData = convertCSVToJSON(text); // si fichier CSV

				const response = await fetch("http://localhost:5000/data", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(jsonData),
				});

				if (!response.ok) {
					throw new Error("Erreur d'envoi JSON");
				}

				const result = await response.json();
				setFileUploaded(result.message);
				console.log("Succès :", result);
			} catch (err) {
				console.error("Erreur parsing/envoi :", err);
			} finally {
				setIsUploading(false);
				setUploadProgress(100);
			}
		};

		reader.readAsText(file);
	};

	return (
		<Card className="bg-gray-800 text-white border border-gray-700">
			<CardContent className="p-6">
				<div className="space-y-4">
					<div className="flex items-center justify-center w-full">
						<label
							htmlFor="file-upload"
							className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 dark:hover:bg-gray-600 dark:bg-gray-800 dark:border-gray-600 dark:hover:border-gray-500"
						>
							<div className="flex flex-col items-center justify-center pt-5 pb-6">
								<Upload className="w-8 h-8 mb-3 text-gray-400" />
								<p className="mb-2 text-sm text-gray-400">
									<span className="font-semibold">
										Click to upload
									</span>{" "}
									or drag and drop
								</p>
								<p className="text-xs text-gray-400">
									CSV, Excel, or JSON files
								</p>
							</div>
							<input
								id="file-upload"
								type="file"
								className="hidden"
								onChange={handleFileChange}
								accept=".csv,.xlsx,.json"
								disabled={isUploading}
							/>
						</label>
					</div>

					{file && (
						<div className="space-y-2">
							<p className="text-sm font-medium text-white">
								Selected file: {file.name}
							</p>
							{isUploading && (
								<div className="space-y-2">
									<Progress
										value={uploadProgress}
										className="h-2"
									/>
									<p className="text-xs text-gray-400">
										Uploading... {uploadProgress}%
									</p>
								</div>
							)}
							<Button
								onClick={handleUpload}
								disabled={isUploading}
								className="w-full bg-blue-600 hover:bg-blue-700 text-white"
							>
								{isUploading ? (
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
										Uploading...
									</>
								) : (
									"Upload File"
								)}
							</Button>
							<Label>
								{fileUploaded && (
									<p className="text-sm font-medium text-green-500">
										{fileUploaded}
									</p>
								)}
							</Label>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}