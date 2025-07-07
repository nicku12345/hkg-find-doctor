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
        doctor_index_urls += [{ "url": a["href"], "medicalSpecialty": a.text } for a in list.find_all("a")]

    doctor_index_urls = [x for x in doctor_index_urls if doc.SEE_DOCTOR_BASE_URL in x["url"]]

    with open("./data/doctor_index_urls.json", "w", encoding="utf-8") as f:
        json.dump(doctor_index_urls, f, indent=4, ensure_ascii=False)
    

if __name__ == "__main__":
    main()