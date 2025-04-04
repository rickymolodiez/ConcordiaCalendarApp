from firestore import store
import time
import schedule

# Simple main file to run the functions
if __name__ == "__main__": 
    schedule.every(2).hours.do(store)
    while True:
        schedule.run_pending()
        time.sleep(1)

