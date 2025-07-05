import argparse
import requests
import logging
import pandas as pd
from bs4 import BeautifulSoup
from multiprocessing import Pool, Lock
from tqdm import tqdm
import json
import functools



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

@functools.lru_cache(128)
def get_als_coordinate(address_desc: str) -> float:
    api = f"https://www.als.gov.hk/lookup?q={address_desc}&n=1"
    als_result = requests.get(api, headers={
        'Accept': 'application/json',
    })

    j = als_result.json()
    geo_info = j["SuggestedAddress"][0]["Address"]["PremisesAddress"]["GeospatialInformation"]
    return geo_info

# DO NOT TRUST the address from source
# re-compute the address coordinates here using als gov API
def get_address_latitude(soup: BeautifulSoup) -> float:
    address_desc = get_address_desc(soup)
    return get_als_coordinate(address_desc)["Latitude"]

def get_address_longitude(soup: BeautifulSoup) -> float:
    address_desc = get_address_desc(soup)
    return get_als_coordinate(address_desc)["Longitude"]

def get_qualifications(soup: BeautifulSoup) -> list[str]:
    detail1 = soup.find("div", id="detail1")
    qualifications = detail1.find("span", itemprop="qualifications")
    return [q.strip() for q in qualifications.text.split("\r\n")]

def parse_opening_hours_line(line: str) -> dict:
    # some examples
    #
    # 星期一 ︰ 0830-1330 1530-2030 
    # 公眾假期 ︰ 0830-1330 1530-2030 
    # 敬請預約
    # 星期一 ︰ 1000-1330; 1500-1830
    # 星期一： 0830-1330;1530-1930
    # Different ":"'s !
    split_char = "@@"
    line = line.replace("︰", split_char).replace("：", split_char)

    # Special case
    # 星期一 10:00-18:00
    if line.count(split_char)==0 and len(line)>=4 and line[3] in [" ", "\t", ":"]:
        line = line[:3] + split_char + line[4:]

    if line.count(split_char) != 1:
        return None
    
    keyMap = {
        "星期一": "MON",
        "星期二": "TUE",
        "星期三": "WED",
        "星期四": "THU",
        "星期五": "FRI",
        "星期六": "SAT",
        "星期日": "SUN",
    }
    
    pref, suff = line.split(split_char)
    pref = pref.strip()
    if pref not in keyMap:
        return None

    key = keyMap[pref]
    suff = suff.strip().lower()
    if "off" in suff or "close" in suff or "休息" in suff:
        return {
            "key": key,
            "value": [],  # No business
        }
    
    suff = suff.replace(" - ", "-").replace(";", " ").replace(",", " ")
    hours = suff.split(" ")
    values = []
    for hour in hours:
        # for simplicity, require the hour string is of the form "HHMM-HHMM"
        # there are other occurences such as "HHMM-HHMM(TST)"
        hour = hour\
            .strip()\
            .replace(" ", "")\
            .replace(":", "")
        
        if len(hour) != 4 + 4 + 1:
            continue
        
        if hour[4] != "-" or hour.count("-") != 1:
            continue

        hhmm_from, hhmm_to = hour.split("-")
        hh_from = int(hhmm_from[:2])
        mm_from = int(hhmm_from[2:])
        hh_to = int(hhmm_to[:2])
        mm_to = int(hhmm_to[2:])

        if hh_from<hh_to or mm_from<=mm_to:
            values.append({
                "from": { "h": hh_from, "m": mm_from },
                "to":   { "h": hh_to,   "m": mm_to   },
            })

    return {
        "key": key,
        "value": values
    }

def get_opening_hours(soup: BeautifulSoup) -> dict[str, list[dict[str, str]]]:
    opening_hours = soup.find("span", itemprop="openingHours").text
    out = {}
    if "敬請預約" in opening_hours:
        out["byAppointment"] = True

    opening_hours = opening_hours.split("\r\n")
    for line in opening_hours:
        if (res := parse_opening_hours_line(line)) is not None:
            out[res["key"]] = res["value"]

    # TODO: for debugging purposes we can include the raw openingHours text here
    return out

def get_soup(url) -> BeautifulSoup:
    response = requests.get(url)

    # Check if the request was successful
    assert response.status_code == 200, f"Failed to fetch site \"{url}\""
    response.encoding = 'utf-8'

    # Parse the HTML content
    return BeautifulSoup(response.text, 'html.parser')

def fetch_doctor_info(url: str) -> dict:
    soup = get_soup(url)
    address_desc = get_address_desc(soup)
    if len(address_desc)<3:  # abnormally short address
        return None

    return {
        "doctorNameTC": get_doctor_name_tc(soup),
        "doctorNameEN": get_doctor_name_en(soup),
        "telephone": get_telephone(soup),
        "medicalSpecialty": get_medical_specialty(soup),
        "addressDesc": get_address_desc(soup),
        "addressLatitude": get_address_latitude(soup),
        "addressLongitude": get_address_longitude(soup),
        "qualifications": json.dumps(get_qualifications(soup), ensure_ascii=False),  # chinese chars
        "openingHours": json.dumps(get_opening_hours(soup), ensure_ascii=False),
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


def main(args):
    all_pages = []

    # produced by getDoctorIndexUrls.py
    with open("./data/doctor_index_urls.json", "r") as f:
        doctor_index_urls = json.load(f)

    url = doctor_index_urls[args.index]
    soup = get_soup(url)
    jump_menu = soup.find("select", id="jumpMenu")
    pages = [option["value"].strip("/") for option in jump_menu.find_all("option") if option.has_attr("value")]
    all_pages.extend(pages)

    # for testing purpose
    # only fetch doctors for the first 10 pages
    # all_pages = all_pages[:10]

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
            if result is not None:
                doctor_infos.append(result)
        
    df = pd.DataFrame(doctor_infos)
    
    df.to_parquet(f"./data/doctor_info_{args.index}.parquet", index=False)
    df.to_csv(f"./data/doctor_info_{args.index}.csv", index=False)

if __name__ == "__main__":
    # Set up argument parsing
    parser = argparse.ArgumentParser(description='Process an index argument.')
    parser.add_argument('--index', type=int, required=True, help='An integer index')

    # Parse the arguments
    args = parser.parse_args()

    # Call the main function with the index argument
    main(args)