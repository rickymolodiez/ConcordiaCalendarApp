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
        'organizer': "Not Available",  # Add default organizer field
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

def extract_category(event):
    metadata = event.find("div", class_="filterMetadata")
    category = "Not Available"

    if metadata:
        categories_element = metadata.find("span", class_="filterCategories")
        if categories_element:
            categories = categories_element.text.strip().split(',')
            if categories: 
                first_category = categories[0].strip()
                category = first_category.split('/')[-1].split(':')[-1]
    return category

    return category

def extract_organizer(event):
    """
    Extract the organizer information from an event element.
    Uses multiple methods to find the most likely organizer.
    """
    organizer = "Not Available"
    
    # Try to extract from URI or ID first
    event_id = None
    accordion_content = event.find("div", class_="accordion-collapse")
    if accordion_content and 'id' in accordion_content.attrs:
        event_id = accordion_content['id']
    
    if event_id:
        # Pattern: content_shared_en_events_offices_provost_fourth_space_2025_04_01_primate_pursuits
        # or: content_shared_en_events_encs_2025_04_01_capstone_poster_presentation
        parts = event_id.split('_')
        org_parts = []
        
        # Look for known faculty/department indicators
        if 'encs' in parts:
            org_parts.append("Faculty of Engineering and Computer Science")
        elif 'artsci' in parts:
            # Check for department after artsci
            idx = parts.index('artsci')
            if idx + 1 < len(parts) and parts[idx+1] not in ['2025', '2024']:
                dept = parts[idx+1].replace('-', ' ').title()
                org_parts.append(f"Faculty of Arts and Science - {dept}")
            else:
                org_parts.append("Faculty of Arts and Science")
        elif 'finearts' in parts:
            # Check for department after finearts
            idx = parts.index('finearts')
            if idx + 1 < len(parts) and parts[idx+1] not in ['2025', '2024']:
                dept = parts[idx+1].replace('-', ' ').title()
                org_parts.append(f"Faculty of Fine Arts - {dept}")
            else:
                org_parts.append("Faculty of Fine Arts")
        elif 'jmsb' in parts:
            org_parts.append("John Molson School of Business")
        elif 'offices' in parts:
            # Handle administrative offices
            idx = parts.index('offices')
            if idx + 1 < len(parts):
                office = parts[idx+1].replace('-', ' ').title()
                org_parts.append(office)
                # Add sub-office if available
                if idx + 2 < len(parts) and parts[idx+2] not in ['2025', '2024']:
                    sub_office = parts[idx+2].replace('-', ' ').title()
                    org_parts.append(sub_office)
        
        if org_parts:
            organizer = " - ".join(org_parts)
    
    # If we couldn't extract from the ID, try metadata
    if organizer == "Not Available":
        metadata = event.find("div", class_="filterMetadata")
        if metadata:
            categories = metadata.find("span", class_="filterCategories")
            if categories:
                cat_text = categories.text.strip()
                # Extract potential organizing entities from categories
                if "topics:academic_disciplines/" in cat_text:
                    matches = re.findall(r'topics:academic_disciplines/([^,]+)', cat_text)
                    if matches:
                        organizer = matches[0].replace('_', ' ').title()
                elif "concordia-events-categories:" in cat_text:
                    matches = re.findall(r'concordia-events-categories:([^,/]+)', cat_text)
                    if matches:
                        organizer = matches[0].replace('-', ' ').title()
    
    # Try to extract from title as last resort
    if organizer == "Not Available":
        title = event.find("h3", class_="accordion-header")
        if title:
            title_text = title.text.strip()
            # Look for department patterns in title
            dept_indicators = ["Department of", "School of", "Faculty of", "Office of", "Centre for"]
            for indicator in dept_indicators:
                if indicator in title_text:
                    parts = title_text.split(indicator, 1)
                    if len(parts) > 1:
                        dept = parts[1].split(",")[0].strip()
                        organizer = f"{indicator} {dept}"
                        break
    
    return organizer

def get_events():
    events = []
    event_html = soup.find_all("div", attrs={"class": "accordion"})
    print(f"Found {len(event_html)} potential events")
    
    for event in event_html:
        try:
            curevent = {}
            title_elem = event.find("div", attrs={"class": "title"})
            if title_elem:
                curevent['name'] = title_elem.text.strip()
            else:
                # Try alternate title location
                title_elem = event.find("button")
                if title_elem:
                    curevent['name'] = title_elem.text.strip()
                else:
                    # No title found, skip this event
                    continue
                    
            rte_elements = event.find_all("div", attrs={"class": "rte"})
            if rte_elements:
                curevent.update(matchRTE(rte_elements))
            
            # Add organizer information with better error handling
            try:
                curevent['organizer'] = extract_organizer(event)
            except Exception as e:
                print(f"Error extracting organizer for '{curevent.get('name', 'Unknown event')}': {e}")
                curevent['organizer'] = "Not Available"
            
            # Set defaults for missing fields
            if not curevent.get('date'):
                curevent['date'] = "Not Available"
            if not curevent.get('location'):
                curevent['location'] = "Not Available"
            if not curevent.get('description'):
                curevent['description'] = "Not Available"
            
            events.append(curevent)
            print(f"Current Event:\n Name: {curevent['name']}\n Date: {curevent['date']}\n Duration: {curevent.get('duration', 0)} hour(s)\n Location: {curevent['location']}\n Organizer: {curevent['organizer']}\n Description: {curevent['description'][:100]}...\n")
            
        except Exception as e:
            print(f"Error processing event: {e}")
    
    return events