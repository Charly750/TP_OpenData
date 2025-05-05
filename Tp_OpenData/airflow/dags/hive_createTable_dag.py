# from airflow import DAG
# from airflow.operators.python import PythonOperator
# from datetime import datetime, timedelta
# from pyhive import hive

# default_args = {
#     'owner': 'airflow',
#     'start_date': datetime(2025, 4, 9),
#     'retries': 1,
#     'retry_delay': timedelta(minutes=5)
# }

# def create_tables_hive():
#     # Remplacer "hive-server" par le vrai hostname ou IP du serveur Hive
#     conn = hive.Connection(host='hive-server', port=10000, database='default')

#     cursor = conn.cursor()

#     # Instructions SQL Hive pour créer les tables
#     hql_statements = [
#         """
#         CREATE TABLE IF NOT EXISTS financial_transactions (
#             transaction_id STRING,
#             date STRING
#         )
#         PARTITIONED BY (dt STRING)
#         STORED AS PARQUET
#         """,
#         """
#         CREATE TABLE IF NOT EXISTS client (
#             id STRING,
#             name STRING,
#             segment STRING,
#             sector STRING,
#             country STRING,
#             region STRING,
#             transaction_id STRING
#         )
#         PARTITIONED BY (dt STRING)
#         STORED AS PARQUET
#         """,
#         """
#         CREATE TABLE IF NOT EXISTS product (
#             id STRING,
#             name STRING,
#             category STRING,
#             subcategory STRING,
#             transaction_id STRING
#         )
#         PARTITIONED BY (dt STRING)
#         STORED AS PARQUET
#         """,
#         """
#         CREATE TABLE IF NOT EXISTS transaction (
#             amount DOUBLE,
#             currency STRING,
#             payment_method STRING,
#             status STRING,
#             transaction_id STRING
#         )
#         PARTITIONED BY (dt STRING)
#         STORED AS PARQUET
#         """,
#         """
#         CREATE TABLE IF NOT EXISTS financial_metrics (
#             revenue DOUBLE,
#             cost DOUBLE,
#             profit DOUBLE,
#             profit_margin DOUBLE,
#             tax DOUBLE,
#             transaction_id STRING
#         )
#         PARTITIONED BY (dt STRING)
#         STORED AS PARQUET
#         """,
#         """
#         CREATE TABLE IF NOT EXISTS performance (
#             delivery_days INT,
#             customer_satisfaction DOUBLE,
#             renewal_probability DOUBLE,
#             transaction_id STRING
#         )
#         PARTITIONED BY (dt STRING)
#         STORED AS PARQUET
#         """
#     ]

#     # Exécution des instructions SQL
#     for hql in hql_statements:
#         print(f"Exécution HQL : {hql}")
#         cursor.execute(hql)

#     cursor.close()
#     conn.close()

# with DAG(
#     'hive_createTable_dag_pyhive',
#     default_args=default_args,
#     tags=["Hive", "CreateTable", "PyHive"],
#     schedule_interval=None,
#     catchup=False
# ) as dag:

#     create_tables_task = PythonOperator(
#         task_id='create_tables_in_hive',
#         python_callable=create_tables_hive
#     )
