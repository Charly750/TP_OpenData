from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests
from rest_framework.permissions import AllowAny, IsAuthenticated
class OpenFactFoodBarCode(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, product_code, format=None):
        try:
            # Construire l'URL avec le code produit
            url = f'https://world.openfoodfacts.org/api/v2/product/{product_code}'
            
            # Effectuer une requête GET vers l'API externe
            response = requests.get(url)
            response.raise_for_status()  # Lève une exception pour les codes d'état HTTP non réussis

            # Traiter les données de l'API externe
            data = response.json()
            print(data['product'])
            product = data['product']
            categories = product.get('categories_tags', [])  # Utilisation de 'categories_tags' qui est une liste de tags

            # Chercher une catégorie qui contient 'fr:' ou utiliser la dernière catégorie
            search_category = None
            for category in categories:
                if category.startswith('fr:'):
                    search_category = category
                    break
            if not search_category and categories:
                search_category = categories[-1]
            
            print(search_category)
            
            if search_category:
                url2 = f'https://world.openfoodfacts.org/api/v2/search?categories_tags_fr={search_category}&countries_tags=en:france|fr:france&sort_by=nutriscore_score&page=1&page_size=5'
                # Effectuer une requête GET vers l'API externe
                response2 = requests.get(url2)
                response2.raise_for_status()  # Lève une exception pour les codes d'état HTTP non réussis

                # Traiter les données de l'API externe
                data2 = response2.json()


                # Retourner les données comme réponse de l'API Django
                return Response(data2, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'No valid category found'}, status=status.HTTP_404_NOT_FOUND)
        except requests.exceptions.RequestException as e:
            # Gérer les erreurs de requête
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except KeyError as e:
            # Gérer les erreurs de clé manquante
            return Response({'error': f'Missing key in response data: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class OpenFactFoodSearch(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, search, format=None):
        try:
            print(search)
            # Construire l'URL pour rechercher par catégorie
            url = f'https://world.openfoodfacts.org/api/v2/search?categories_tags_fr={search}&countries_tags=en:france|fr:france&sort_by=nutriscore_score&page=1&page_size=5'

            # Effectuer une requête GET vers l'API externe
            response = requests.get(url)
            response.raise_for_status()  # Lève une exception pour les codes d'état HTTP non réussis

            # Traiter les données de l'API externe
            data = response.json()
            print(data)

            # Si aucun produit n'est trouvé, rechercher par marque
            if len(data['products']) < 5:
                url = f'https://world.openfoodfacts.org/api/v2/search?brands_tags_fr={search}&countries_tags=en:france|fr:france&sort_by=nutriscore_score&page=1&page_size=5'
                response = requests.get(url)
                response.raise_for_status()  # Lève une exception pour les codes d'état HTTP non réussis

                # Traiter les données de l'API externe
                data = response.json()
                print(data)

            # Retourner les données comme réponse de l'API Django
            return Response(data, status=status.HTTP_200_OK)

        except requests.exceptions.RequestException as e:
            # Gérer les erreurs de requête
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except KeyError as e:
            # Gérer les erreurs de clé manquante
            return Response({'error': f'Missing key in response data: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
