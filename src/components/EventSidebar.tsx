import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { 
  Plus, 
  Calendar, 
  Clock, 
  User, 
  Filter,
  Search,
  X,
  ChevronRight
} from 'lucide-react';
import { useEventContext } from '../contexts/EventContext';
import { CalendarEvent } from '../contexts/EventContext';
import './EventSidebar.css';

interface EventSidebarProps {
  selectedDate: Date | null;
  onEventClick: (event: CalendarEvent) => void;
  onCreateEvent: () => void;
  isOpen: boolean;
}

const EventSidebar: React.FC<EventSidebarProps> = ({
  selectedDate,
  onEventClick,
  onCreateEvent,
  isOpen,
}) => {
  const { events, getEventsByDate } = useEventContext();
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedDateEvents = selectedDate 
    ? getEventsByDate(format(selectedDate, 'yyyy-MM-dd'))
    : [];

  const allEvents = events.slice().sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.startTime}`);
    const dateB = new Date(`${b.date}T${b.startTime}`);
    return dateA.getTime() - dateB.getTime();
  });

  const filteredEvents = allEvents.filter(event => {
    const matchesFilter = filter === 'all' || event.category === filter;
    const matchesSearch = !searchQuery || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      work: 'category-work',
      personal: 'category-personal',
      health: 'category-health',
      social: 'category-social',
      travel: 'category-travel',
      other: 'category-other',
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="event-sidebar glass"
    >
      <div className="sidebar-content">
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-title-row">
            <h2 className="sidebar-title">Events</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCreateEvent}
              className="btn btn-primary create-btn"
            >
              <Plus size={20} />
            </motion.button>
          </div>

          {/* Selected Date Info */}
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="selected-date-info"
            >
              <div className="date-info-content">
                <Calendar size={20} />
                <span className="date-text">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </span>
              </div>
              <p className="event-count">
                {selectedDateEvents.length} event(s) scheduled
              </p>
            </motion.div>
          )}

          {/* Search */}
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="search-clear"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filter */}
          <div className="filter-container">
            <Filter size={16} />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="health">Health</option>
              <option value="social">Social</option>
              <option value="travel">Travel</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Events List */}
        <div className="events-list">
          {selectedDate ? (
            /* Selected Date Events */
            <div className="events-section">
              <h3 className="section-title">
                Events for {format(selectedDate, 'MMM d')}
              </h3>
              <AnimatePresence>
                {selectedDateEvents.length > 0 ? (
                  selectedDateEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => onEventClick(event)}
                      className="event-card"
                    >
                      <div className="event-header">
                        <h4 className="event-title">{event.title}</h4>
                        <ChevronRight size={16} className="event-arrow" />
                      </div>
                      
                      <div className="event-meta">
                        <Clock size={16} />
                        <span>{event.startTime} - {event.endTime}</span>
                      </div>

                      <div className="event-badges">
                        <span className={`category-badge ${getCategoryColor(event.category)}`}>
                          {event.category}
                        </span>
                        <span className={`priority-badge ${getPriorityColor(event.priority)}`}>
                          {event.priority}
                        </span>
                      </div>

                      <div className="event-author">
                        <User size={12} />
                        <span>Created by {event.createdByName}</span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="empty-state">
                    <Calendar size={48} className="empty-icon" />
                    <p className="empty-title">No events scheduled</p>
                    <button
                      onClick={onCreateEvent}
                      className="empty-action"
                    >
                      Create your first event
                    </button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* All Events */
            <div className="events-section">
              <h3 className="section-title">
                All Events ({filteredEvents.length})
              </h3>
              <AnimatePresence>
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => onEventClick(event)}
                      className="event-card"
                    >
                      <div className="event-header">
                        <h4 className="event-title">{event.title}</h4>
                        <ChevronRight size={16} className="event-arrow" />
                      </div>
                      
                      <div className="event-meta">
                        <Calendar size={16} />
                        <span>{format(new Date(event.date), 'MMM d, yyyy')}</span>
                      </div>

                      <div className="event-meta">
                        <Clock size={16} />
                        <span>{event.startTime} - {event.endTime}</span>
                      </div>

                      <div className="event-badges">
                        <span className={`category-badge ${getCategoryColor(event.category)}`}>
                          {event.category}
                        </span>
                        <span className={`priority-badge ${getPriorityColor(event.priority)}`}>
                          {event.priority}
                        </span>
                      </div>

                      <div className="event-author">
                        <User size={12} />
                        <span>Created by {event.createdByName}</span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="empty-state">
                    <Search size={48} className="empty-icon" />
                    <p className="empty-title">No events found</p>
                    <p className="empty-subtitle">Try adjusting your search or filter</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default EventSidebar;