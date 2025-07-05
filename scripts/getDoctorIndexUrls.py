import requests
import logging
import pandas as pd
from bs4 import BeautifulSoup
from multiprocessing import Pool, Lock
from tqdm import tqdm
import json
import functools


import fetchDoctorInfo as doc

def main():
    soup = doc.get_soup(doc.SEE_DOCTOR_BASE_URL)

    lists = soup.find_all("div", id="doctor_link")
    doctor_index_urls = []
    for list in lists:
        doctor_index_urls += [a["href"] for a in list.find_all("a")]

    doctor_index_urls = [url for url in doctor_index_urls if doc.SEE_DOCTOR_BASE_URL in url]
    with open("./data/doctor_index_urls.json", "w") as f:
        json.dump(doctor_index_urls, f, indent=4)
    

if __name__ == "__main__":
    main()