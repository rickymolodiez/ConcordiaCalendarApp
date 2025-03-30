import firebase_admin
import json
from firebase_admin import credentials, firestore
import os 

# More fixes for path issues 
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
AUTH_FILE = os.path.join(SCRIPT_DIR, "auth.json")



from scraper import get_events
# Initialize Firebase
cred = credentials.Certificate(AUTH_FILE)
firebase_admin.initialize_app(cred)

# Get the events
events = get_events()


db = firestore.client()

# Test data
# with open('testdata.json','r') as f:
#     data = json.load(f)
# for key, value in data.items():
#     db.collection("books").document(key).set(value)

# Store the events in the database
def store():
    for event in events:
        db.collection("events").document(event['name'].replace("/", "_")).set(event)

        # Debuggings purpose
        # print(event['name'], event['date'])
