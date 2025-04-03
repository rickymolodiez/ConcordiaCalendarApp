import React from "react";
import "../styles/calendar.css";

const CalendarEvent = ({ event, columnWidth, onClick }) => {
  const top = parseFloat(event.startHour) * 60; // supports decimals
  const height = parseFloat(event.duration) * 60;

  const style = {
    position: "absolute",
    top: `${top}px`,
    left: `${60 + event.day * columnWidth}px`,
    height: `${height}px`,
    width: `${columnWidth}px`,
    backgroundColor: "#fbb254",
    borderRadius: "10px",
    padding: "6px 8px",
    fontWeight: "bold",
    color: "#8a2c3f",
    fontSize: "13px",
    boxSizing: "border-box",
    cursor: "pointer",
    zIndex: 5,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: "2px",
  };

  const secondaryTextStyle = {
    fontSize: "11px",
    fontWeight: "500",
    color: "#7b2d2d",
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
