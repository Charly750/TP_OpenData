import './Login.css'
import { useState,useEffect } from 'react';


export const Login = () => {
  const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    useEffect(() => {
      localStorage.clear()
      
      
  }, []); 
    const handleLogin = async () => {
      try {
        const response = await fetch('https://openfoodfact-g2.onrender.com/api/token/', {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: username,
            password: password
          })
        });
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        const { access, refresh } = data;
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        console.log('Logged in');
        console.log(data);
        window.location.href = '/';
      } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
      }
      
    };      
   return (
     <>
       <div className="d-flex h-100 w-100 justify-content-center align-items-center">
         <div className='d-flex flex-row'>
            <div id="form-left" className='d-flex flex-column align-items-center justify-content-center'>
              <h2 className='mb-3'>Login</h2>
              <input type="text" className="form-control mb-2" placeholder="Username"value={username} 
                onChange={(e) => setUsername(e.target.value)} ></input>
              <input type="password" className="form-control mb-3" placeholder="Mot de passe" value={password} 
                onChange={(e) => setPassword(e.target.value)} ></input>
              <button type="button" className="btn btn-primary" onClick={handleLogin}>Se connecter</button>
              <a href='/register'>S'inscrire</a>
            </div>
            <div id="form-right"></div>
         </div>
         
       </div>
     </>
   );
 };