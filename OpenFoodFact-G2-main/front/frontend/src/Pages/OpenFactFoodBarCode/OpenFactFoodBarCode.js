// OpenFactFoodBarCode.js
import React, { useState, useEffect } from "react";
import "./OpenFactFoodBarCode.css";

export const OpenFactFoodBarCode = () => {
  const [productData, setProductData] = useState(null);
  const [error, setError] = useState(null);
  const [productCode, setProductCode] = useState(""); // State pour stocker le code produit

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      // Gérer l'absence de token, par exemple rediriger vers la page de connexion
      console.error("No token found in localStorage");
    }
  }, []);

  const handleInputChange = (event) => {
    setProductCode(event.target.value); // Met à jour le state avec la valeur du champ de saisie
  };

  const handleAddProduct = async (product) => {
    try {
      const response = await fetch(
        `https://openfoodfact-g2.onrender.com/api/products/add/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`, // Utilisation du token JWT depuis le localStorage
          },
          body: JSON.stringify({ data: product }), // Envoie du produit entier dans le champ 'data'
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout du produit");
      }

      console.log("Produit ajouté avec succès!");
      // Vous pouvez ajouter ici une logique pour mettre à jour l'interface utilisateur si nécessaire
    } catch (error) {
      console.error("Erreur lors de l'ajout du produit:", error);
      setError("Erreur lors de l'ajout du produit");
    }
  };

  const handleFetchData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No token found in localStorage");
      }

      const response = await fetch(
        `https://openfoodfact-g2.onrender.com/api/openfactfood/${productCode}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log(data);
      setProductData(data.products); // Met à jour le state avec les données récupérées depuis l'API Django
      setError(null); // Réinitialise les erreurs
    } catch (error) {
      console.error("Error fetching product data:", error);
      setError("Error fetching product data"); // Définit l'erreur d'état
    }
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-center">
        <div className="input-group p-4 d-flex justify-content-center">
          <input
            type="text"
            id="productCode"
            className="form-control"
            name="productCode"
            value={productCode}
            onChange={handleInputChange}
            placeholder="Entrer le code barre "
          />
          <button className="btn btn-primary" onClick={handleFetchData}>
            Rechercher
          </button>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}
      {productData && (
        <div className="d-flex flex-wrap justify-content-around">
          {productData.map((product) => (
            <div key={product._id} className="card shadow-sm">
              <div className="d-flex justify-content-center align-items-center">
                <img
                  src={product.image_thumb_url}
                  className="rounded img-fluid"
                  alt="..."
                />
              </div>
              <div className="card-body">
                <h6 className="card-title">{product.product_name}</h6>
                <p className="card-text">Nutriscore: {product.nutrition_grades}</p>
                <p className="card-text">Nova: {product.nova_group}</p>
                <p className="card-text">Ecoscore: {product.ecoscore_grade}</p>
                <p className="card-text">Magasin: {product.stores}</p>
                <a href={product.url} className="btn btn-link" target="_blank" rel="noopener noreferrer">
                  Details
                </a>
                <button className="btn btn-primary" onClick={() => handleAddProduct(product)}>
                  Ajouter
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OpenFactFoodBarCode;
