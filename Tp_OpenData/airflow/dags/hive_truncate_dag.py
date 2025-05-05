from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta
from pyhive import hive

default_args = {
    'owner': 'airflow',
    'start_date': datetime(2025, 4, 10),
    'retries': 1,
    'retry_delay': timedelta(minutes=5)
}

def truncate_hive_tables():
    # Connexion au serveur Hive
    conn = hive.Connection(host='hive-server', port=10000, database='default')
    cursor = conn.cursor()
    
    # Liste des tables à vider
    tables = [
        'financial_transactions',
        'client',
        'product',
        'transaction',
        'financial_metrics',
        'performance'
    ]
    
    for table in tables:
        try:
            # Option 1: Suppression des données en conservant la structure
            truncate_query = f"TRUNCATE TABLE {table}"
            print(f"Exécution HQL : {truncate_query}")
            cursor.execute(truncate_query)
            
            # Option 2: Alternative avec DELETE (si TRUNCATE n'est pas supporté)
            # delete_query = f"DELETE FROM {table}"
            # print(f"Exécution HQL : {delete_query}")
            # cursor.execute(delete_query)
            
            print(f"Table {table} vidée avec succès")
        except Exception as e:
            print(f"Erreur lors du vidage de la table {table}: {str(e)}")
    
    # Si vous voulez vider une partition spécifique pour chaque table
    partition_date = '2025-04-09'
    for table in tables:
        try:
            partition_query = f"ALTER TABLE {table} DROP PARTITION (dt='{partition_date}')"
            print(f"Exécution HQL : {partition_query}")
            cursor.execute(partition_query)
            print(f"Partition dt='{partition_date}' supprimée de la table {table}")
        except Exception as e:
            print(f"Erreur lors de la suppression de la partition de la table {table}: {str(e)}")
    
    cursor.close()
    conn.close()

with DAG(
    'hive_truncate_tables_dag',
    default_args=default_args,
    tags=["Hive", "Truncate", "PyHive"],
    schedule_interval=None,
    catchup=False
) as dag:

    truncate_task = PythonOperator(
        task_id='truncate_hive_tables_task',
        python_callable=truncate_hive_tables
    )