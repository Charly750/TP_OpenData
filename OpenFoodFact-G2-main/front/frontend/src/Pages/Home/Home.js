import './Home.css';
import React from 'react';

export const Home = () => {

  const navigateTo = (path) => {
    window.location.href = path;
  }

  return (
    <div className="container">
      <div className="content">
        <h1>Recherche de Produits Substituts avec Meilleur Nutriscore</h1>
        <div className="description">
          <h2>Bienvenue sur notre site !</h2>
          <p>
            Ce projet a été pensé pour vous aider à améliorer votre santé en trouvant des produits meilleurs à consommer
            simplement en changeant de marque.<br/>
            Utilisez notre outil pour rechercher des substituts avec un meilleur Nutriscore, que ce soit par catégorie ou par code-barres.
          </p>
          <h2>À propos de nous</h2>
          <p>
            Ce projet a été réalisé par Charly et Guillaume dans le cadre d'un projet d'API Django avec React.<br/>
            Nous espérons que vous trouverez notre site utile et qu'il contribuera à votre bien-être.
          </p>
        </div>
        <div className="button-group">
          <button className="btn btn-primary" onClick={() => navigateTo('/search')}>Remplacer un aliment</button>
          <button className="btn btn-primary" onClick={() => navigateTo('/searchbarcode')}>Code barre de l'aliment</button>
          <button className="btn btn-primary" onClick={() => navigateTo('/myfood')}>Mes aliments</button>
        </div>
      </div>
    </div>
  );
};
