import requests
import bs4
import os

# URL of the page to scrape
URL = "https://www.concordia.ca/events.html"
# Potential TODO : Add selection on startup for which audience to scrape from/have different audiences in the database to select from.
# URL = "https://www.concordia.ca/events.html?audience=concordia-community/students"
# Get the page

def get_page(): 
    response = requests.get(URL)

    if response.status_code == 200:
        print("Page found")

        with open ("./storage/events.html", "w", encoding="utf-8") as file:
            file.write(response.text)

# Save the response to a file for processing
# TODO : Add a timer to check how long ago the file was last updated and update if more than n days
if not os.path.exists("./storage/events.html"):
    html_content = get_page()
else:
    with open("./storage/events.html", "r", encoding="utf-8") as file:
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
    }

    for rte in rte_elements:
        clean_text = rte.get_text(strip=True)
        if dateOrNot(clean_text):
            event_data['date'] = clean_text
        elif locationOrNot(clean_text):
            event_data['location'] = clean_text
        elif descOrNot(clean_text):
            event_data['description'] = clean_text

    if not event_data['location'] and event_data['description']:
        event_data['location'] = event_data['description']
        event_data['description'] = ""  

    return event_data
     

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
        print(f"Current Event:\n Name: {curevent['name']}\n Date: {curevent['date']}\n Location: {curevent['location']}\n Description: {curevent['description']}\n " )
        print(f"\n")
    return events


