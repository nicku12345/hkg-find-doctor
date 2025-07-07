import os
import json
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

def main():
    # Load environment variables from .env file
    load_dotenv()

    # Retrieve the database URL from environment variables
    db_url = os.getenv("SUPABASE_DATABASE_URL")
    if not db_url:
        raise ValueError("No DATABASE_URL found in environment variables.")

    # Create a database engine
    engine = create_engine(db_url)

    # Drop the table if it exists
    with engine.connect() as connection:
        connection.execute(text("DROP TABLE IF EXISTS \"DoctorInfo\" CASCADE"))
        connection.commit()

    with open("./data/doctor_index_urls.json", "r", encoding="utf-8") as f:
        doctor_index_urls = json.load(f)

    for i in range(len(doctor_index_urls)):
        # Specify the path to your Parquet file
        parquet_file_path = f'./data/doctor_info_{i}.parquet'
        if not os.path.exists(parquet_file_path) or os.path.getsize(parquet_file_path) == 0:
            continue

        # Read the Parquet file into a DataFrame
        df = pd.read_parquet(parquet_file_path)

        # Convert numpy.ndarray columns to lists or strings
        for column in df.select_dtypes(include=['object']).columns:
            df[column] = df[column].apply(lambda x: x.tolist() if isinstance(x, np.ndarray) else x)

        # Upload the DataFrame to the database
        df.to_sql('DoctorInfo', con=engine, if_exists='append', index=False)

        print(f"Data from {parquet_file_path} uploaded to 'DoctorInfo' table successfully.")

if __name__ == "__main__":
    main()