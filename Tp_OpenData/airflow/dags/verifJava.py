from datetime import datetime
from airflow.operators.bash import BashOperator
from airflow import DAG
with DAG(
   "verifJava",
   tags=["verifJava", "bash"],
   start_date=datetime(2025, 4, 8)
) as dag:

    check_java = BashOperator(
        task_id='check_java',
        bash_command='echo JAVA_HOME=$JAVA_HOME && ls $JAVA_HOME && java -version'
    )