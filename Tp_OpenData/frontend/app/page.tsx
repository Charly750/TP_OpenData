import Home from "./home";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./login/login";
import Dashboard from "./dashboard/dashboard";
import Register from "./register/register";
import { isAuthenticated } from "../lib/auth";
import { Navigate } from "react-router-dom";

export default function Page() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/login" element={<Login />} />
				<Route
					path="/dashboard"
					element={
						isAuthenticated() ? <Dashboard /> : <Navigate to="/" />
						// <Dashboard />
					}
				/>
				<Route path="/register" element={<Register />} />
			</Routes>
		</Router>
	);
}
