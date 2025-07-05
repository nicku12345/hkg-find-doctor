#!/bin/bash

# File containing the URLs
FILE="./data/doctor_index_urls.json"

# Count the occurrences of 'https'
count=$(grep -o "https" "$FILE" | wc -l)

# Loop through the occurrences and run the Python script
for ((i=0; i<count; i++)); do
    echo "III - Running: python scripts/fetchDoctorInfo.py --index $i"
    python scripts/fetchDoctorInfo.py --index "$i"
done