import requests
import logging
import pandas as pd
from bs4 import BeautifulSoup
from multiprocessing import Pool, Lock
from tqdm import tqdm
import json



SEE_DOCTOR_BASE_URL = "https://www.seedoctor.com.hk"

def get_doctor_name_tc(soup: BeautifulSoup) -> str:
    dr_info = soup.find("div", id="dr_info")
    return dr_info.find("b", itemprop="additionalName").text.strip()

def get_doctor_name_en(soup: BeautifulSoup) -> str:
    dr_info = soup.find("div", id="dr_info")
    return dr_info.find("b", attrs={"itemprop": False}).text.strip()

def get_telephone(soup: BeautifulSoup) -> str:
    detail = soup.find("div", id="detail1")
    return detail.find("span", itemprop="telephone").text.strip().replace(" ", "")

def get_medical_specialty(soup: BeautifulSoup) -> str:
    dr_info = soup.find("div", id="dr_info")
    return dr_info.find("span", itemprop="medicalSpecialty").text.strip()

def get_address_desc(soup: BeautifulSoup) -> str:
    detail1 = soup.find("div", id="detail1")
    address = detail1.find("span", itemprop="address")
    return address.text.strip()

def get_address_url(soup: BeautifulSoup) -> str:
    detail1 = soup.find("div", id="detail1")
    address = detail1.find("span", itemprop="address")
    google_map_url = address.find_parent("a")["href"].replace("\r\n", "")
    return google_map_url

def get_address_latitude(soup: BeautifulSoup) -> float:
    google_map_url = get_address_url(soup)
    return float(google_map_url.split("?q=")[-1].split(",")[0])

def get_address_longitude(soup: BeautifulSoup) -> float:
    google_map_url = get_address_url(soup)
    return float(google_map_url.split("?q=")[-1].split(",")[1])

def get_qualifications(soup: BeautifulSoup) -> list[str]:
    detail1 = soup.find("div", id="detail1")
    qualifications = detail1.find("span", itemprop="qualifications")
    return [q.strip() for q in qualifications.text.split("\r\n")]

def get_soup(url) -> BeautifulSoup:
    response = requests.get(url)

    # Check if the request was successful
    assert response.status_code == 200, f"Failed to fetch site \"{url}\""
    response.encoding = 'utf-8'

    # Parse the HTML content
    return BeautifulSoup(response.text, 'html.parser')

def fetch_doctor_info(url: str) -> dict:
    soup = get_soup(url)
    return {
        "doctorNameTC": get_doctor_name_tc(soup),
        "doctorNameEN": get_doctor_name_en(soup),
        "telephone": get_telephone(soup),
        "medicalSpecialty": get_medical_specialty(soup),
        "addressDesc": get_address_desc(soup),
        "addressLatitude": get_address_latitude(soup),
        "addressLongitude": get_address_longitude(soup),
        "qualifications": get_qualifications(soup),
    }

def fetch_doctor_urls(page: str) -> list[str]:
    page_soup = get_soup(f"{SEE_DOCTOR_BASE_URL}/{page}")
    dr_intro = page_soup.find("div", id="dr_intro")
    
    doctor_urls = []
    if dr_intro:
        doctors = dr_intro.find_all("div", class_="all5 bgc_b1")
        for doctor in doctors:
            a_tag = doctor.find("a")
            if a_tag and a_tag.has_attr("href"):
                doctor_urls.append(a_tag["href"])
    
    return doctor_urls


def main():
    doctor_index_urls = [
        "general-out-patient-doctor.asp"
    ]

    all_pages = []
    for url in doctor_index_urls:
        soup = get_soup(f"{SEE_DOCTOR_BASE_URL}/{url}")
        jump_menu = soup.find("select", id="jumpMenu")
        pages = [option["value"].strip("/") for option in jump_menu.find_all("option") if option.has_attr("value")]
        all_pages.extend(pages)

    # for testing purpose
    # only fetch doctors for the first 10 pages
    all_pages = all_pages[:10]

    logging.info(f"Fetching {len(all_pages)} pages of seedoctor.com to get a list of doctors")

    doctor_urls = []
    with Pool(processes=10) as pool:
        for result in tqdm(pool.imap(fetch_doctor_urls, all_pages), total=len(all_pages), desc="Fetching Doctor URLs"):
            doctor_urls.extend(result)

    logging.info(f"Total number of doctors: {len(doctor_urls)}")

    doctor_urls = [f"{SEE_DOCTOR_BASE_URL}/{url}" for url in doctor_urls]
    doctor_infos = []
    with Pool(processes=10) as pool:
        for result in tqdm(pool.imap(fetch_doctor_info, doctor_urls), total=len(doctor_urls), desc="Fetching Doctor Infos"):
            doctor_infos.append(result)
        
    df = pd.DataFrame(doctor_infos)
    
    df.to_parquet("./data/doctor_info.parquet", index=False)
    df.to_csv("./data/doctor_info.csv", index=False)

if __name__ == "__main__":
    main()