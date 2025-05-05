from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime
from pyhive import hive

default_args = {
    'owner': 'airflow',
    'start_date': datetime(2023, 1, 1),
}

def select_from_hive():
    # Remplacer "hive-server" par le vrai hostname ou IP du serveur Hive
    conn = hive.Connection(host='hive-server', port=10000, database='default')

    cursor = conn.cursor()

    # Exécution de la requête HQL avec jointures entre plusieurs tables
    hql = """
    SELECT
        ft.transaction_id,
        ft.date,
        c.name AS client_name,
        c.segment AS client_segment,
        p.name AS product_name,
        t.amount AS transaction_amount,
        t.currency AS transaction_currency,
        fm.revenue AS financial_revenue,
        fm.profit AS financial_profit,
        pr.delivery_days AS performance_delivery_days,
        pr.customer_satisfaction AS performance_customer_satisfaction
    FROM financial_transactions ft
    JOIN client c ON ft.transaction_id = c.transaction_id
    JOIN product p ON ft.transaction_id = p.transaction_id
    JOIN transaction t ON ft.transaction_id = t.transaction_id
    JOIN financial_metrics fm ON ft.transaction_id = fm.transaction_id
    JOIN performance pr ON ft.transaction_id = pr.transaction_id
    """
    print(f"Exécution HQL : {hql}")
    cursor.execute(hql)

    # Récupérer et afficher les résultats
    results = cursor.fetchall()
    for row in results:
        print(row)

    cursor.close()
    conn.close()

with DAG(
    'hive_select_dag_pyhive',
    default_args=default_args,
    tags=["Hive", "Select", "PyHive"],
    schedule_interval=None,
    catchup=False
) as dag:

    select_task = PythonOperator(
        task_id='select_from_hive',
        python_callable=select_from_hive
    )
