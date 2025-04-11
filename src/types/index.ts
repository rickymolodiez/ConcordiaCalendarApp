/**
 * Core application types for the Concordia Calendar App
 */

// Event related types
export interface Event {
  // Core properties
  id?: string;
  label: string;
  organizer: string;
  category: string;
  description: string;
  location: string;
  eligibility: string;
  
  // Time related properties
  date: string;
  time?: string;
  startHour: number | string;
  startMinute: number | string;
  endHour: number | string;
  endMinute: number | string;
  duration?: number;  // Add duration property
  day?: number;       // Add day property for calendar positioning
  
  // Optional properties
  registrationLink?: string;
  campus?: string;
  audiences?: string[];
}

// User related types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  club1?: string;
  club2?: string;
  club3?: string;
  club4?: string;
  club5?: string;
}

// Form data types
export interface EventFormData {
  label: string;
  organizer: string;
  category: string;
  date: string;
  startHour: string;
  startMinute: string;
  endHour: string;
  endMinute: string;
  location: string;
  eligibility: string;
  description: string;
  registrationLink?: string;
}

// Component prop types
export interface EventModalProps {
  event: Event | null;
  onClose: () => void;
}

export interface CalendarEventProps {
  event: Event;
  columnWidth: number;  // Add this property
  onClick: (event: Event) => void;
}

export interface SidebarWidgetsProps {
  subscriptions: string[];
  onVisibilityChange: (visibilityMap: Record<string, boolean>) => void;
}

export interface SearchDropdownProps {
  onSubscribe: (clubName: string) => void;
}

export interface WeeklyCalendarProps {
  subscriptions: string[]; // Array of subscribed club/organizer names
}

// Calendar-related types
export interface CalendarDay {
  date: Date;
  events: Event[];
  isToday: boolean;
}