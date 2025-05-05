import './Myfood.css';
import React, { useState, useEffect } from "react";

export const Myfood = () => {
  const [userData, setUserData] = useState(null); // State pour stocker les données de l'utilisateur
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const accessToken = localStorage.getItem("access_token"); // Récupère le token JWT depuis le localStorage
        if (!accessToken) {
          throw new Error("Access token not found in localStorage");
        }

        const response = await fetch("https://openfoodfact-g2.onrender.com/api/products/getproductbyuser/", {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Utilise le token JWT pour l'authentification
          },
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setUserData(data); // Met à jour le state avec les données reçues
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError('Erreur lors de la récupération des produits');
      }
    };

    fetchUserData(); // Appel de la fonction fetch au chargement du composant
  }, []); // Le tableau vide en second argument signifie que useEffect s'exécutera une seule fois après le montage initial

  const handleDeleteProduct = async (product_id) => {
    try {
      const response = await fetch(`https://openfoodfact-g2.onrender.com/api/products/delete/${product_id}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`, // Utilisation du token JWT depuis le localStorage
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du produit');
      }

      // Mettre à jour l'état pour supprimer le produit de l'interface utilisateur
      setUserData((prevUserData) => prevUserData.filter(product => product.id !== product_id));
      console.log('Produit supprimé avec succès!');
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
      setError('Erreur lors de la suppression du produit');
    }
  };

  if (!userData) {
    return <div>Loading...</div>; // Affichage d'un message de chargement tant que les données ne sont pas chargées
  }

  return (
    <div className="container">
      {error && <p className="error-message">{error}</p>}
      {userData.length > 0 && (
        <div className="d-flex flex-wrap justify-content-around">
          {userData.map(product => (
            <div key={product.data.id} className="card">
              <div className="card-img-container">
                <img src={product.data.image_thumb_url} className="card-img-top" alt="..." />
              </div>
              <div className="card-body">
                <h6 className="card-title">{product.data.product_name}</h6>
                <p className="card-text">Nutriscore: {product.data.nutrition_grades}</p>
                <p className="card-text">Nova: {product.data.nova_group}</p>
                <p className="card-text">Ecoscore: {product.data.ecoscore_grade}</p>
                <p className="card-text">Magasin: {product.data.stores}</p>
                <div className="d-flex justify-content-between">
                  <a href={product.data.url} className="btn-link" target="_blank" rel="noopener noreferrer">Details</a>
                  <button className="btn btn-primary" onClick={() => handleDeleteProduct(product.id)}>Supprimer</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
