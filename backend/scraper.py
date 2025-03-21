import requests
import bs4

# URL of the page to scrape
URL = "https://www.concordia.ca/events.html"
# Get the page
response = requests.get(URL)

# Save the response to a file for processing
# TODO : Add a timer to check how long ago the file was last updated and update if more than n days
file = open("events.html", "w+")
file.write(response.text)
soup = bs4.BeautifulSoup(file, "html5lib")


# Get the events using BS4
# TODO : Find a ways to get each event's properties (name, date, description) when they are not in the same div
# HINT : use a dictionary to store strings that could identify the properties (example date: "Feb", "Jan"
def get_events():
    events = []
    event_html = soup.find_all("div", attrs={"class": "accordion"})
    for event in event_html:
        curevent = {}
        curevent['name'] = event.find("div", attrs={"class": "title"}).text.strip()
        curevent['date'] = event.find_all("div", attrs={"class": "rte"})[1].text.strip()
        curevent['description'] = event.find_all("div", attrs={"class": "rte"})[0].text.strip()
        events.append(curevent)
    return events
print(get_events())
