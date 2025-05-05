// main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import Page from "./app/page";
import "./app/globals.css";

const rootElement = document.getElementById("root") as HTMLElement;
const root = ReactDOM.createRoot(rootElement);

root.render(
	<React.StrictMode>
		<Page />
	</React.StrictMode>
);
