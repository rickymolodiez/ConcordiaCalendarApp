import requests
import bs4
import os
from datetime import datetime, timedelta
import re

# URL of the page to scrape
URL = "https://www.concordia.ca/events.html"
# Potential TODO : Add selection on startup for which audience to scrape from/have different audiences in the database to select from.
# URL = "https://www.concordia.ca/events.html?audience=concordia-community/students"
# Get the page

# Solve file handling being weird for no reason

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
STORAGE_DIR = os.path.join(SCRIPT_DIR, "storage")
EVENTS_FILE = os.path.join(STORAGE_DIR, "events.html")
def get_page(): 
    response = requests.get(URL)

    if response.status_code == 200:
        print("Page found")

        with open (EVENTS_FILE, "w", encoding="utf-8") as file:
            file.write(response.text)

# Save the response to a file for processing
# TODO : Add a timer to check how long ago the file was last updated and update if more than n days
if not os.path.exists(EVENTS_FILE):
    html_content = get_page()
else:
    with open(EVENTS_FILE, "r", encoding="utf-8") as file:
            html_content = file.read()

soup = bs4.BeautifulSoup(html_content, "html5lib")


# Get the events using BS4

# TODO : Find a ways to get each event's properties (name, date, description) when they are not in the same div
# Related TODO : Fix the location of event detection in the scraper

# TODO : Data should be structured this way in the DB :
"""
String: Event Category 
Date: Date
Time: Time
String: Location
String: Attendee Eligibility
String: Event Descriptions
"""

def dateOrNot(parsedString):
    months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    for month in months:
        if month.casefold() in parsedString.casefold():
            return 1
    return 0

def descOrNot(parsedString):
    if len(parsedString.split()) > 5: 
        return True
    return False


def locationOrNot(parsedString):
    location_keywords = ["campus", "building", "street", "room", "hall", "address", "online"]
    for keyword in location_keywords:
        if keyword.casefold() in parsedString.casefold():
            return True
    return False

def matchRTE(rte_elements):
    event_data = {
        'description': "",
        'date': "",
        'location': "",
        'duration': 0,
    }

    for rte in rte_elements:
        clean_text = rte.get_text(strip=True)
        if dateOrNot(clean_text):
            try: 
                dateobj, dur = parse_date(clean_text)
                if dateobj:
                    event_data['date'] = dateobj.isoformat()
                    event_data['duration'] = dur
                else:
                    event_data['date'] = "Not Available"
            except ValueError:
                event_data['date'] = "Not Available"
        elif locationOrNot(clean_text):
            event_data['location'] = clean_text
        elif descOrNot(clean_text):
            event_data['description'] = clean_text

    if not event_data['location'] and event_data['description']:
        event_data['location'] = event_data['description']
        event_data['description'] = ""  

    return event_data
     

def parse_date(date_string):
    # Example date string: "April 1, 2025, 10 a.m. – 1 p.m."
    parts = [part.strip() for part in date_string.split(",")]
    if len(parts) >= 2:
        date_str = f"{parts[0]}, {parts[1]}"
    else:
        date_str = date_string.strip()
    
    formats = [
        "%B %d, %Y",
        "%b %d, %Y"   
    ]
    date_obj = None
    for fmt in formats:
        try:
            date_obj = datetime.strptime(date_str, fmt)
            break
        except ValueError:
            continue

    if not date_obj:
        return None, 0
    
    start_datetime = datetime.combine(date_obj.date(), datetime.min.time())
    duration = 0

    if len(parts) >= 3:
    
        time_range_str = parts[2]
        time_parts = re.split(r"[–-]", time_range_str)
        if len(time_parts) >= 1:
            start_time_str = time_parts[0].strip().replace(".", "")
            def parse_time(ts):
                for fmt in ("%I:%M %p", "%I %p"):
                    try:
                        return datetime.strptime(ts, fmt)
                    except ValueError:
                        pass
                return None
            start_time = parse_time(start_time_str)
            if start_time:
                # Combine date and start time.
                start_datetime = datetime.combine(date_obj.date(), start_time.time())
            if len(time_parts) == 2:
                end_time_str = time_parts[1].strip().replace(".", "")
                end_time = parse_time(end_time_str)
                if start_time and end_time:
                    end_dt = datetime.combine(date_obj.date(), end_time.time())
                    diff = end_dt - start_datetime
                    if diff.total_seconds() < 0:
                        diff += timedelta(days=1)
                    duration = int(diff.total_seconds() // 3600)
    return start_datetime, duration



def get_events():
    events = []
    event_html = soup.find_all("div", attrs={"class": "accordion"})
    for event in event_html:
        curevent = {}
        curevent['name'] = event.find("div", attrs={"class": "title"}).text.strip()
        rte_elements = event.find_all("div", attrs={"class": "rte"})
        curevent.update(matchRTE(rte_elements))
        if not curevent['date']:
            curevent['date'] = "Not Available"
        if not curevent['location']:
            curevent['location'] = "Not Available"
        if not curevent['description']:
            curevent['description'] = "Not Available"
        events.append(curevent)  
        print(f"Current Event:\n Name: {curevent['name']}\n Date: {curevent['date']}\n Duration: {curevent['duration']} hours\n Location: {curevent['location']}\n Description: {curevent['description']}\n " )
        print(f"\n")
    return events
