import React, { useEffect, useRef, useState } from 'react';
import "../styles/calendar.css"
import SearchDropdown from './SearchDropdown';
import CalendarEvent from '../components/CalendarEvent';
import EventModal from '../components/EventModel';
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from '../firebase'; // ✅ instead of initializing here



const WeeklyCalendar = ({ subscriptions }) => {
  const weekDaysRef = useRef();
  const monthYearRef = useRef();
  const selectedDayRef = useRef();
  const timeGridRef = useRef();
  const currentLineRef = useRef();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  
  


  const getWeekDates = () => {
    const start = getStartOfWeek(currentDate);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      dates.push(`${yyyy}-${mm}-${dd}`);
    }
    return dates;
  };
  
 
  
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d;
  };
  
  const renderWeek = () => {
    if (!weekDaysRef.current) return;
    weekDaysRef.current.innerHTML = '<div class="time-placeholder"></div>';
    const startOfWeek = getStartOfWeek(currentDate);
    const monthName = startOfWeek.toLocaleString("default", { month: "short" });
    monthYearRef.current.innerText = `${monthName.toUpperCase()} ${startOfWeek.getDate()}`;
    selectedDayRef.current.innerText = currentDate.getDate().toString().padStart(2, '0');
    
    for (let i = 0; i < 7; i++) {
      const temp = new Date(startOfWeek);
      temp.setDate(startOfWeek.getDate() + i);
      const dayNum = temp.getDate().toString().padStart(2, "0");
      const dayName = temp.toLocaleString("default", { weekday: "short" }).toUpperCase();
      const isToday = temp.toDateString() === new Date().toDateString();
      const cell = document.createElement('div');
      cell.innerHTML = `<span class="${isToday ? 'today-highlight' : ''}">${dayNum}</span><br>${dayName}`;
      weekDaysRef.current.appendChild(cell);
    }
  };
  
  const buildTimeGrid = () => {
    if (!timeGridRef.current) return;
    timeGridRef.current.innerHTML = '';
    for (let h = 0; h < 24; h++) {
      const hour = h.toString().padStart(2, '0') + ':00';
      const label = document.createElement('div');
      label.className = 'time-slot time-label';
      label.innerText = hour;
      timeGridRef.current.appendChild(label);
      for (let i = 0; i < 7; i++) {
        const slot = document.createElement('div');
        slot.className = 'time-slot';
        timeGridRef.current.appendChild(slot);
      }
    }
  

 
    
    
    const gridWrapper = timeGridRef.current.parentElement;
    const calendarWidth = timeGridRef.current.offsetWidth;
    const columnWidth = (calendarWidth - 60) / 7;
  
    // Remove previous events
    Array.from(gridWrapper.querySelectorAll('.event')).forEach(el => el.remove());
  
 
  };

  

  const updateCurrentTimeLine = () => {
    if (!currentLineRef.current || !timeGridRef.current) return;

    const now = new Date();
    const top = now.getHours() * 60 + now.getMinutes();
    const columnWidth = (timeGridRef.current.offsetWidth - 60) / 7;
    const monday = getStartOfWeek(currentDate);
    const diff = Math.floor((now - monday) / (1000 * 60 * 60 * 24));

    if (diff >= 0 && diff < 7) {
      currentLineRef.current.style.display = 'block';
      currentLineRef.current.style.top = `${top}px`;
      currentLineRef.current.style.left = `${60 + diff * columnWidth}px`;
      currentLineRef.current.style.width = `${columnWidth}px`;
    } else {
      currentLineRef.current.style.display = 'none';
    }
  };

  const changeWeek = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + offset * 7);
    setCurrentDate(newDate);
  };

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  useEffect(() => {
    renderWeek();
    buildTimeGrid();
    updateCurrentTimeLine();
    const interval = setInterval(updateCurrentTimeLine, 60000);
    return () => clearInterval(interval);
  }, [currentDate]);
  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const snapshot = await getDocs(collection(db, "eventsFromApp"));
        const fetchedEvents = snapshot.docs.map(doc => doc.data());
        setEvents(fetchedEvents); // ✅ store events
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
  
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event =>
    subscriptions.includes(event.organizer)
  );
  
  
  
  return (
    <div className="calendar-wrapper">
      <div className="calendar">
        <div className="calendar-header">
          <div className="date-nav">
            <div className="top-arrows">
              <span onClick={() => changeWeek(-1)}>&#x276E;</span>
              <div className="selected-day" ref={selectedDayRef}>01</div>
              <span onClick={() => changeWeek(1)}>&#x276F;</span>
            </div>
            <div className="bottom-arrows">
              <span onClick={() => changeMonth(-1)}>&#x276E;</span>
              <div id="monthYear" ref={monthYearRef}>MAR 25</div>
              <span onClick={() => changeMonth(1)}>&#x276F;</span>
            </div>
          </div>
        </div>
        
       

<div className="week-days sticky-header" ref={weekDaysRef}></div>

<div className="scrollable-grid-wrapper">
  <div className="grid-wrapper">
    <div className="time-grid" ref={timeGridRef}></div>

    {timeGridRef.current &&
      filteredEvents
        .filter(event => getWeekDates().includes(event.date))
        .map((event, index) => {
          const weekDates = getWeekDates();
          const dayIndex = weekDates.indexOf(event.date);
          return (
            <CalendarEvent
              key={index}
              event={{ ...event, day: dayIndex }}
              columnWidth={(timeGridRef.current.offsetWidth - 60) / 7}
              onClick={setSelectedEvent}
            />
          );
        })}

    <div className="current-time-line" ref={currentLineRef}></div>
  </div>
</div>
        
        
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      
      </div>
    </div>
  );
};

export default WeeklyCalendar;
