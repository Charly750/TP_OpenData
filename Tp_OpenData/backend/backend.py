# backend_test.py
from flask import Flask, request, jsonify
from kafka import KafkaProducer
import json
import random
import time
from flask_cors import CORS
app = Flask(__name__)
CORS(app)
producer = KafkaProducer(
    bootstrap_servers='kafka:9092',
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

# @app.route('/data', methods=['GET'])
# def get_products():
#     products = [
#         {"id": "1", "name": "Laptop", "price": 999.99},
#         {"id": "2", "name": "Smartphone", "price": 499.49},
#         {"id": "3", "name": "Tablet", "price": 299.99}
#     ]

#     # Envoie les produits dans Kafka
#     for product in products:
#         producer.send("topic1", product)

#     return jsonify({"message": "Produits envoyés à Kafka (topic1).", "data": products})

@app.route('/data', methods=['POST'])
def get_data():
    datas = request.get_json()  # récupère les données JSON envoyées
    # Envoie les produits dans Kafka
    try :
        for data in datas:
            
            # return jsonify({"message": "Data envoyés à Kafka (topic1).", "data": data["transaction_id"]})
            data['client']["transaction_id"] = data["transaction_id"]
            data['product']["transaction_id"] = data["transaction_id"]
            data['transaction']["transaction_id"] = data["transaction_id"]
            data['financial_metrics']["transaction_id"] = data["transaction_id"]
            data['performance']["transaction_id"] = data["transaction_id"]

            producer.send("topic1", data)
            producer.send("topic2", data['client'])
            producer.send("topic3", data['product'])
            producer.send("topic4", data['transaction'])
            producer.send("topic5", data['financial_metrics'])
            producer.send("topic6", data['performance'])
        return jsonify({"message": "Votre fichier a été envoyé avec succès!", "data": datas})
    except Exception as e:
        return jsonify({"message": "Erreur lors de l'envoi des données!", "error": str(e)}), 500


@app.route('/auth', methods=['POST'])
def auth():
    data = request.get_json()  # récupère les données JSON envoyées
    username = data.get('username')
    password = data.get('password')
    if username == 'admin' and password == 'admin':
        return jsonify({"message": "Authentification réussie"}), 200
    else:
        return jsonify({"message": "Authentification échouée"}), 401
# @app.route('/purchase', methods=['POST'])
# def post_purchase():
#     # Données d'achat générées aléatoirement
#     user_id = str(random.randint(1, 100))
#     product_id = random.choice(["1", "2", "3"])
#     quantity = random.randint(1, 5)
#     prices = {"1": 999.99, "2": 499.49, "3": 299.99}
#     total = round(prices[product_id] * quantity, 2)

#     data = {
#         "user_id": user_id,
#         "product_id": product_id,
#         "quantity": quantity,
#         "total": total
#     }

#     producer.send("topic2", data)
#     return jsonify({"message": "Achat aléatoire publié dans Kafka (topic2).", "data": data})

# @app.route('/random-batch', methods=['POST'])
# def random_batch():
#     batch = []
#     for _ in range(10):
#         user_id = str(random.randint(1, 100))
#         product_id = random.choice(["1", "2", "3"])
#         quantity = random.randint(1, 5)
#         prices = {"1": 999.99, "2": 499.49, "3": 299.99}
#         total = round(prices[product_id] * quantity, 2)
#         data = {
#             "user_id": user_id,
#             "product_id": product_id,
#             "quantity": quantity,
#             "total": total
#         }
#         producer.send("topic2", data)
#         batch.append(data)
#         time.sleep(0.2)  # petite pause pour simuler un flux

#     return jsonify({"message": "Batch d'achats aléatoires envoyé dans Kafka.", "data": batch})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
