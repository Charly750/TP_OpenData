import "./Register.css"
import { useState } from "react";

export const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }
    try {
      const response = await fetch('https://openfoodfact-g2.onrender.com/api/register/', {
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
      console.log('User registered');
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
              <h2 className='mb-3'>Inscription</h2>
              <input type="text" className="form-control mb-2" placeholder="Username"value={username} 
                onChange={(e) => setUsername(e.target.value)} ></input>
              <input type="password" className="form-control mb-2" placeholder="Mot de passe" value={password} 
                onChange={(e) => setPassword(e.target.value)} ></input>
              <input type="password" className="form-control mb-3" placeholder="Confirmer votre mot de passe" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}></input>
              <button type="button" className="btn btn-primary" onClick={handleRegister}>S'enregistrer</button>
              <a href='/login'>Déjà un compte ?</a>
            </div>
            <div id="form-right"></div>
         </div> 
       </div>
     </>
   );
 };