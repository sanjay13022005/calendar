import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import CalendarGrid from '../components/CalendarGrid';
import EventSidebar from '../components/EventSidebar';
import EventModal from '../components/EventModal';
import NotificationPanel from '../components/NotificationPanel';
import { CalendarEvent } from '../contexts/EventContext';
import './CalendarPage.css';

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleEventClick = (event: CalendarEvent) => {
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsSidebarOpen(true);
  };

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setIsEventModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEventModalOpen(false);
    setEditingEvent(null);
  };

  return (
    <div className="calendar-page">
      <Header 
        onCreateEvent={handleCreateEvent}
        onToggleNotifications={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <div className="calendar-layout">
        {/* Main Calendar Content */}
        <div className={`calendar-main ${isSidebarOpen ? 'with-sidebar' : ''}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="calendar-content"
          >
            <CalendarGrid
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onDateClick={handleDateClick}
              onEventClick={handleEventClick}
              selectedDate={selectedDate}
            />
          </motion.div>
        </div>

        {/* Event Sidebar */}
        <motion.div
          initial={{ x: 320 }}
          animate={{ x: isSidebarOpen ? 0 : 320 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="calendar-sidebar"
        >
          <EventSidebar
            selectedDate={selectedDate}
            onEventClick={handleEventClick}
            onCreateEvent={handleCreateEvent}
            isOpen={isSidebarOpen}
          />
        </motion.div>

        {/* Notification Panel */}
        <NotificationPanel
          isOpen={isNotificationPanelOpen}
          onClose={() => setIsNotificationPanelOpen(false)}
        />
      </div>

      {/* Event Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={handleCloseModal}
        event={editingEvent}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default CalendarPage;