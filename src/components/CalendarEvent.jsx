
import React from "react";
import CLUB_COLORS from "../constants/clubColors";

const CalendarEvent = ({ event, columnWidth, onClick }) => {
  const top = parseFloat(event.startHour) * 60;
  const height = parseFloat(event.duration) * 60;

  const eventColor = CLUB_COLORS[event.organizer] || "#fbb254"; // fallback

  const style = {
    position: "absolute",
    top: `${top}px`,
    left: `${60 + event.day * columnWidth}px`,
    height: `${height}px`,
    width: `${columnWidth}px`,
    backgroundColor: eventColor,
    borderRadius: "10px",
    padding: "6px 8px",
    fontWeight: "bold",
    color: "#fff",
    fontSize: "13px",
    boxSizing: "border-box",
    cursor: "pointer",
    zIndex: 5,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: "2px",
    overflow: "hidden",        // hides any overflowing text
    textOverflow: "ellipsis",  // adds ... to cut-off lines
    whiteSpace: "normal"       // allows wrapping (use carefully with ellipsis)
  
  };

  const secondaryTextStyle = {
    fontSize: "11px",
    fontWeight: "500",
    color: "#fff",
  };

  return (
    <div style={style} onClick={() => onClick(event)}>
      <div>{event.label}</div>
      <div style={secondaryTextStyle}>{event.organizer}</div>
      <div style={secondaryTextStyle}>{event.location}</div>
    </div>
  );
};

export default CalendarEvent;
