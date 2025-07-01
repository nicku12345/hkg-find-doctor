import os
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

    # Specify the path to your Parquet file
    parquet_file_path = './data/doctor_info.parquet'

    # Read the Parquet file into a DataFrame
    df = pd.read_parquet(parquet_file_path)

    # Convert numpy.ndarray columns to lists or strings
    for column in df.select_dtypes(include=['object']).columns:
        df[column] = df[column].apply(lambda x: x.tolist() if isinstance(x, np.ndarray) else x)

    # Drop the table if it exists
    with engine.connect() as connection:
        connection.execute(text("DROP TABLE IF EXISTS \"DoctorInfo\""))

    # Upload the DataFrame to the database
    df.to_sql('DoctorInfo', con=engine, if_exists='append', index=False)

    print("Data from Parquet file uploaded to 'DoctorInfo' table successfully.")

if __name__ == "__main__":
    main()