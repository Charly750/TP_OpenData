import { Routes, Route, useLocation, Navigate } from 'react-router-dom';

import { Navbar } from "./Layout/Navbar";
import { Home } from './Pages/Home/Home';
import { Myfood } from './Pages/Myfood/Myfood';
import { Login } from './Pages/Login/Login';
import { Register } from './Pages/Register/Register';
import { NotFound } from './Pages/NotFound';
import OpenFactFoodBarCode from './Pages/OpenFactFoodBarCode/OpenFactFoodBarCode';
import OpenFactFoodSearch from './Pages/OpenFactFoodSearch/OpenFactFoodSearch';
import { Logout } from './Pages/Logout/Logout';
import { useState,useEffect } from 'react';
 
function App() {
  const [isUserLogged,SetIsUserLogged] = useState(false);
  const location = useLocation();
  const hideNavbarPaths = ["/login", "/Register","/logout"];
  useEffect(() => {
    let token = localStorage.getItem('access_token')
    if (token) {
      SetIsUserLogged(true)
    }
   
}, []); 
  return (
    <>
      {isUserLogged && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/logout" element={<Logout />} />
        {isUserLogged &&(
        <>
        <Route path="/" element={<Home/>}  />
        <Route path="/search" element={<OpenFactFoodSearch />} />
        
        <Route path="/myfood" element={<Myfood />} />
        <Route path="/searchbarcode" element={<OpenFactFoodBarCode />} />
        <Route path="*" element={<NotFound />} /> {/* 404 route */}
        </>
)}
      </Routes>
    </>
  );
}

export default App;
