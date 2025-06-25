import React from 'react';
import { motion } from 'framer-motion';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  addMonths,
  subMonths
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEventContext } from '../contexts/EventContext';
import { CalendarEvent } from '../contexts/EventContext';
import './CalendarGrid.css';

interface CalendarGridProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  selectedDate: Date | null;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  onDateChange,
  onDateClick,
  onEventClick,
  selectedDate,
}) => {
  const { getEventsByDate } = useEventContext();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = direction === 'prev' 
      ? subMonths(currentDate, 1) 
      : addMonths(currentDate, 1);
    onDateChange(newDate);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      work: 'event-work',
      personal: 'event-personal',
      health: 'event-health',
      social: 'event-social',
      travel: 'event-travel',
      other: 'event-other',
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '';
    }
  };

  return (
    <div className="calendar-grid card">
      {/* Calendar Header */}
      <div className="calendar-header">
        <motion.h2
          key={format(currentDate, 'MMMM yyyy')}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="calendar-title"
        >
          {format(currentDate, 'MMMM yyyy')}
        </motion.h2>
        
        <div className="calendar-nav">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigateMonth('prev')}
            className="nav-button"
          >
            <ChevronLeft size={20} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDateChange(new Date())}
            className="today-button"
          >
            Today
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigateMonth('next')}
            className="nav-button"
          >
            <ChevronRight size={20} />
          </motion.button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="weekday-headers">
        {weekdays.map((day) => (
          <div key={day} className="weekday-header">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <motion.div
        key={format(currentDate, 'yyyy-MM')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="calendar-days"
      >
        {days.map((day, index) => {
          const dayEvents = getEventsByDate(format(day, 'yyyy-MM-dd'));
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isDayToday = isToday(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);

          return (
            <motion.div
              key={day.toISOString()}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01, duration: 0.2 }}
              onClick={() => onDateClick(day)}
              className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isDayToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
            >
              {/* Day Number */}
              <div className="day-number">
                {format(day, 'd')}
              </div>

              {/* Events */}
              <div className="day-events">
                {dayEvents.slice(0, 3).map((event, eventIndex) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: eventIndex * 0.05 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    className={`event-item ${getCategoryColor(event.category)}`}
                  >
                    <div className="event-content">
                      <span className="event-priority">{getPriorityIndicator(event.priority)}</span>
                      <span className="event-title">{event.title}</span>
                    </div>
                    <div className="event-time">
                      {event.startTime}
                    </div>
                  </motion.div>
                ))}
                
                {dayEvents.length > 3 && (
                  <div className="more-events">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Legend */}
      <div className="calendar-legend">
        <h3 className="legend-title">Categories</h3>
        <div className="legend-items">
          {[
            { key: 'work', label: 'Work', color: 'legend-work' },
            { key: 'personal', label: 'Personal', color: 'legend-personal' },
            { key: 'health', label: 'Health', color: 'legend-health' },
            { key: 'social', label: 'Social', color: 'legend-social' },
            { key: 'travel', label: 'Travel', color: 'legend-travel' },
            { key: 'other', label: 'Other', color: 'legend-other' },
          ].map((category) => (
            <div key={category.key} className="legend-item">
              <div className={`legend-color ${category.color}`}></div>
              <span className="legend-label">{category.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarGrid;