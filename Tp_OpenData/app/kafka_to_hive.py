# -*- coding: utf-8 -*-
import logging
from pyspark import SparkContext
from pyspark.sql import SparkSession
from pyspark.sql.functions import from_json, col, current_date
from pyspark.sql.types import StructType, StringType, IntegerType, DoubleType

# Réduction des logs
logging.getLogger("py4j").setLevel(logging.WARN)
SparkContext.setSystemProperty("spark.ui.showConsoleProgress", "false")

# Création de la session Spark avec Hive
spark = SparkSession.builder \
    .appName("KafkaTopicsToHive") \
    .enableHiveSupport() \
    .config("spark.sql.warehouse.dir", "/user/hive/warehouse") \
    .config("hive.metastore.uris", "thrift://hive-metastore:9083") \
    .config("hive.exec.dynamic.partition", "true") \
    .config("hive.exec.dynamic.partition.mode", "nonstrict") \
    .getOrCreate()


spark.sparkContext.setLogLevel("WARN")
topic1_schema = StructType() \
    .add("transaction_id", StringType()) \
    .add("date", StringType()) \


topic2_schema = StructType() \
    .add("id", StringType()) \
    .add("name", StringType()) \
    .add("segment", StringType()) \
    .add("sector", StringType()) \
    .add("country", StringType()) \
    .add("region", StringType()) \
    .add("transaction_id", StringType()) \

topic3_schema = StructType() \
    .add("id", StringType()) \
    .add("name", StringType()) \
    .add("category", StringType()) \
    .add("subcategory", StringType()) \
    .add("transaction_id", StringType()) \

topic4_schema = StructType() \
    .add("amount", DoubleType()) \
    .add("currency", StringType()) \
    .add("payment_method", StringType()) \
    .add("status", StringType()) \
    .add("transaction_id", StringType()) \

topic5_schema = StructType() \
    .add("revenue", DoubleType()) \
    .add("cost", DoubleType()) \
     .add("profit", DoubleType()) \
      .add("profit_margin", DoubleType()) \
       .add("tax", DoubleType()) \
    .add("transaction_id", StringType()) \

topic6_schema = StructType() \
    .add("delivery_days", IntegerType()) \
    .add("customer_satisfaction", DoubleType()) \
     .add("renewal_probability", DoubleType()) \
    .add("transaction_id", StringType()) \
# topic1_schema = StructType() \
#     .add("id", StringType()) \
#     .add("name", StringType()) \
#     .add("price", DoubleType())

# topic2_schema = StructType() \
#     .add("user_id", StringType()) \
#     .add("product_id", StringType()) \
#     .add("quantity", IntegerType()) \
#     .add("total", DoubleType())

# Création des tables Hive si elles n'existent pas
spark.sql("""
CREATE TABLE IF NOT EXISTS financial_transactions (
    transaction_id STRING,
    date STRING
)
PARTITIONED BY (dt STRING)
STORED AS PARQUET
""")

spark.sql("""
CREATE TABLE IF NOT EXISTS client (
    id STRING,
    name STRING,
    segment STRING,
    sector STRING,
    country STRING,
    region STRING,
    transaction_id STRING
)
PARTITIONED BY (dt STRING)
STORED AS PARQUET
""")

spark.sql("""
CREATE TABLE IF NOT EXISTS product (
    id STRING,
    name STRING,
    category STRING,
    subcategory STRING,
    transaction_id STRING
)
PARTITIONED BY (dt STRING)
STORED AS PARQUET
""")

spark.sql("""
CREATE TABLE IF NOT EXISTS transaction (
    amount DOUBLE,
    currency STRING,
    payment_method STRING,
    status STRING,
    transaction_id STRING
)
PARTITIONED BY (dt STRING)
STORED AS PARQUET
""")

spark.sql("""
CREATE TABLE IF NOT EXISTS financial_metrics (
    revenue DOUBLE,
    cost DOUBLE,
    profit DOUBLE,
    profit_margin DOUBLE,
    tax DOUBLE,
    transaction_id STRING
)
PARTITIONED BY (dt STRING)
STORED AS PARQUET
""")

spark.sql("""
CREATE TABLE IF NOT EXISTS performance (
    delivery_days INT,
    customer_satisfaction DOUBLE,
    renewal_probability DOUBLE,
    transaction_id STRING
)
PARTITIONED BY (dt STRING)
STORED AS PARQUET
""") 

# spark.sql("""
# CREATE TABLE IF NOT EXISTS purchases (
#     user_id STRING,
#     product_id STRING,
#     quantity INT,
#     total DOUBLE
# )
# PARTITIONED BY (dt STRING)
# STORED AS PARQUET
# """)

# Fonction de traitement de batch
def log_and_write_batch(df, epoch_id, table_name):
    print("\n📦 Nouveau batch reçu pour la table Hive: {}".format(table_name))
    try:
        df.show(truncate=False)
        df.withColumn("dt", current_date().cast("string")) \
        .write \
        .mode("append") \
        .format("hive") \
        .partitionBy("dt") \
        .saveAsTable(table_name)
        print("\n📦 Nouveau batch reçu pour la table Hive: {}".format(table_name))
    except Exception as e:
        print("\n❌ Erreur lors de l'écriture dans la table Hive: {}".format(table_name))
        print(e)
# Fonction streaming Kafka → Hive
def stream_to_hive(topic, schema, table_name):
    df = spark.readStream \
        .format("kafka") \
        .option("kafka.bootstrap.servers", "kafka:9092") \
        .option("subscribe", topic) \
        .load()

    parsed_df = df.selectExpr("CAST(value AS STRING)") \
        .select(from_json(col("value"), schema).alias("data")) \
        .select("data.*")

    return parsed_df.writeStream \
        .outputMode("append") \
        .foreachBatch(lambda df, epoch: log_and_write_batch(df, epoch, table_name)) \
        .option("checkpointLocation", "/tmp/checkpoint_{}".format(table_name)) \
        .start()

# Lancer les streams
print("🔄 Streaming topic1 → Hive table products")
q1 = stream_to_hive("topic1", topic1_schema, "financial_transactions")

print("🔄 Streaming topic2 → Hive table purchases")
q2 = stream_to_hive("topic2", topic2_schema, "client")

print("🔄 Streaming topic3 → Hive table purchases")
q3 = stream_to_hive("topic3", topic3_schema, "product")

print("🔄 Streaming topic4 → Hive table purchases")
q4 = stream_to_hive("topic4", topic4_schema, "transaction")

print("🔄 Streaming topic5 → Hive table purchases")
q5 = stream_to_hive("topic5", topic5_schema, "financial_metrics")

print("🔄 Streaming topic6 → Hive table purchases")
q6 = stream_to_hive("topic6", topic6_schema, "performance")

print("✅ Streaming en cours... (Ctrl+C pour arrêter)")
spark.streams.awaitAnyTermination()
