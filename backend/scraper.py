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

# HINT : use a dictionary to store strings that could identify the properties (example date: "Feb", "Jan")
def get_events():
    events = []
    event_html = soup.find_all("div", attrs={"class": "accordion"})
    print(f"Found {len(event_html)} events")
    for event in event_html:
        curevent = {}
        curevent['name'] = event.find("div", attrs={"class": "title"}).text.strip()
        curevent['date'] = event.find_all("div", attrs={"class": "rte"})[1].text.strip()
        curevent['description'] = event.find_all("div", attrs={"class": "rte"})[0].text.strip()
        events.append(curevent)
    return events
print(get_events())
