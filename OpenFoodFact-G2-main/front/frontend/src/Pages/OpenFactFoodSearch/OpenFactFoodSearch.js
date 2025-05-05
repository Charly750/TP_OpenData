import React, { useState } from 'react';
import './OpenFactFoodSearch.css';

const OpenFactFoodSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);

  const handleAddProduct = async (product) => {
    try {
      const response = await fetch(`https://openfoodfact-g2.onrender.com/api/products/add/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ data: product }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout du produit');
      }

      console.log('Produit ajouté avec succès!');
      // Add UI update logic here if needed

    } catch (error) {
      console.error('Erreur lors de l\'ajout du produit:', error);
      setError('Erreur lors de l\'ajout du produit');
    }
  };

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = async () => {
    try {
      const response = await fetch(`https://openfoodfact-g2.onrender.com/api/openfactfood/search/${searchTerm}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log(data);
      setSearchResults(data.products);
      setError(null);
    } catch (error) {
      console.error('Error fetching search data:', error);
      setError('Error fetching search data');
    }
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-center">
        <div className="input-group p-4 d-flex justify-content-center">
          <input
            type="text"
            id="searchTerm"
            className="form-control"
            name="searchTerm"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder='Categories ou marques'
          />
          <button className="btn btn-primary" onClick={handleSearch}>Rechercher</button>
        </div>
      </div> 
      {error && <p className="error-message">{error}</p>}
      {searchResults.length > 0 && (
        <div className="d-flex flex-wrap justify-content-around">
          {searchResults.map(product => (
            <div key={product._id} className="card shadow-sm">
              <div className="d-flex justify-content-center align-items-center">
                <img src={product.image_thumb_url} className="rounded img-fluid" alt="..." />
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
                                <button className="btn btn-primary" onClick={() => handleAddProduct(product)}>Ajouter</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OpenFactFoodSearch;
