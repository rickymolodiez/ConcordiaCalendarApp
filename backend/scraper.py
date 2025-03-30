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
    months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November"", December"]
    for month in months:
        if month.casefold() in parsedString.casefold():
            return 1
    return 0

def get_events():
    events = []
    event_html = soup.find_all("div", attrs={"class": "accordion"})
    for event in event_html:
        curevent = {}
        curevent['name'] = event.find("div", attrs={"class": "title"}).text.strip()
        rte_elements = event.find_all("div", attrs={"class": "rte"})
        
        ## no string in RTE tags
        if not rte_elements:
                    curevent['description'] = "No description available"
                    curevent['date'] = "No date available"
        # only one of the RTE tags is populated
        elif len(rte_elements) == 1:
            rteStr = rte_elements[0].text.strip()
            if dateOrNot(rteStr):
                curevent['date'] = rteStr
                curevent['description'] = "No description is available."
            else:
                curevent['description'] = rteStr
                curevent['date'] = "No date available"  
        ##both RTE tags are populated
        else:
            text1, text2 = rte_elements[0].text.strip(), rte_elements[1].text.strip()
            if dateOrNot(text1):
                curevent['date'], curevent['description'] = text1, text2 or "No description available"
            elif dateOrNot(text2):
                curevent['date'], curevent['description'] = text2, text1 or "No description available"
            else:
                curevent['description'], curevent['date'] = text1 or "No description available", text2 or "No date available"

        events.append(curevent)
    return events

