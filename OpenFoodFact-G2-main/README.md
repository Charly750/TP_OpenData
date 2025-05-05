# OpenFoodFact-G2
projet back en python/django rest framework
cd back/backoffice
pip install -r requirements.txt
run python manage.py runserver
Le serveur s'ouvre sur http://127.0.0.1:8000/
en prod : https://openfoodfact-g2.onrender.com


projet front
cd front/frontend
npm install
npm start
Le serveur s'ouvre sur http://127.0.0.1:3000/
en prod : https://openfoodfact-g2-1.onrender.com

Les requetes du front sont paramétré sur la prod, si modification du back il faut push sur github qui pushera automatiqument sur render.
le front s'autodeploy aussi apres un push git.