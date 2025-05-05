
from datetime import datetime
from airflow import DAG
from airflow.operators.python import PythonOperator

def my_task():
    print("Hello, this is my task!")


with DAG(
   "example_dag",
   tags=["example","python"],
   start_date=datetime(2025, 4, 8)


) as dag:
    my_task = PythonOperator(
        task_id='Hello_world',
        python_callable=my_task,
        dag=dag,
    )
