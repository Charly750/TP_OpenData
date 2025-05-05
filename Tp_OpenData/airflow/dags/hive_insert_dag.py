from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta
from pyhive import hive

default_args = {
    'owner': 'airflow',
    'start_date': datetime(2025, 4, 9),
    'retries': 1,
    'retry_delay': timedelta(minutes=5)
}

def insert_into_hive():
    # Remplace "hive-server" par le vrai hostname ou IP du serveur Hive
    conn = hive.Connection(host='hive-server', port=10000, database='default')

    cursor = conn.cursor()

    # Insertion dans la table financial_transactions
    hql_statements = [
        "INSERT INTO TABLE financial_transactions PARTITION (dt='2025-04-09') VALUES ('txn001', '2025-04-09')",
        "INSERT INTO TABLE client PARTITION (dt='2025-04-09') VALUES ('c001', 'John Doe', 'Retail', 'Electronics', 'USA', 'North America', 'txn001')",
        "INSERT INTO TABLE product PARTITION (dt='2025-04-09') VALUES ('p001', 'Clavier mécanique', 'Electronics', 'Keyboard', 'txn001')",
        "INSERT INTO TABLE transaction PARTITION (dt='2025-04-09') VALUES (99.99, 'USD', 'Credit Card', 'Completed', 'txn001')",
        "INSERT INTO TABLE financial_metrics PARTITION (dt='2025-04-09') VALUES (5000.00, 3000.00, 2000.00, 40.0, 500.00, 'txn001')",
        "INSERT INTO TABLE performance PARTITION (dt='2025-04-09') VALUES (3, 4.5, 0.85, 'txn001')"
    ]

    # Exécution des instructions SQL
    for hql in hql_statements:
        print(f"Exécution HQL : {hql}")
        cursor.execute(hql)

    cursor.close()
    conn.close()

with DAG(
    'hive_insert_dag_pyhive',
    default_args=default_args,
    tags=["Hive", "Insert", "PyHive"],
    schedule_interval=None,
    catchup=False
) as dag:

    insert_task = PythonOperator(
        task_id='pyhive_insert_task',
        python_callable=insert_into_hive
    )
