import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuthContext } from './AuthContext';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  category: 'work' | 'personal' | 'health' | 'social' | 'travel' | 'other';
  priority: 'low' | 'medium' | 'high';
  createdBy: string;
  createdByName: string;
  createdAt: string;
  reminder?: number; // minutes before event
}

interface EventContextType {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdBy' | 'createdByName' | 'createdAt'>) => void;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  getEventsByDate: (date: string) => CalendarEvent[];
  searchEvents: (query: string) => CalendarEvent[];
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const useEventContext = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
};

interface EventProviderProps {
  children: ReactNode;
}

export const EventProvider: React.FC<EventProviderProps> = ({ children }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const { user } = useAuthContext();

  useEffect(() => {
    // Load events from localStorage on mount
    const storedEvents = localStorage.getItem('calendar_events');
    if (storedEvents) {
      try {
        setEvents(JSON.parse(storedEvents));
      } catch (error) {
        console.error('Error parsing stored events:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Save events to localStorage whenever events change
    localStorage.setItem('calendar_events', JSON.stringify(events));
  }, [events]);

  const addEvent = (eventData: Omit<CalendarEvent, 'id' | 'createdBy' | 'createdByName' | 'createdAt'>) => {
    if (!user) return;

    const newEvent: CalendarEvent = {
      ...eventData,
      id: Date.now().toString(),
      createdBy: user.id,
      createdByName: user.name,
      createdAt: new Date().toISOString(),
    };

    setEvents(prev => [...prev, newEvent]);
    toast.success('Event created successfully!');
    
    // Log to terminal
    console.log(`[EVENT CREATED] "${newEvent.title}" by ${user.name} for ${format(new Date(newEvent.date), 'MMM dd, yyyy')} at ${newEvent.startTime}`);
  };

  const updateEvent = (id: string, eventData: Partial<CalendarEvent>) => {
    setEvents(prev => prev.map(event => 
      event.id === id ? { ...event, ...eventData } : event
    ));
    toast.success('Event updated successfully!');
    
    // Log to terminal
    if (user) {
      console.log(`[EVENT UPDATED] Event ID: ${id} updated by ${user.name}`);
    }
  };

  const deleteEvent = (id: string) => {
    const event = events.find(e => e.id === id);
    setEvents(prev => prev.filter(event => event.id !== id));
    toast.success('Event deleted successfully!');
    
    // Log to terminal
    if (user && event) {
      console.log(`[EVENT DELETED] "${event.title}" deleted by ${user.name}`);
    }
  };

  const getEventsByDate = (date: string): CalendarEvent[] => {
    return events.filter(event => event.date === date);
  };

  const searchEvents = (query: string): CalendarEvent[] => {
    const lowercaseQuery = query.toLowerCase();
    return events.filter(event => 
      event.title.toLowerCase().includes(lowercaseQuery) ||
      event.description?.toLowerCase().includes(lowercaseQuery) ||
      event.category.toLowerCase().includes(lowercaseQuery)
    );
  };

  const value = {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsByDate,
    searchEvents,
  };

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};