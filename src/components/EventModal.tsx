import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { 
  X, 
  Calendar, 
  Clock, 
  Type, 
  FileText, 
  Tag, 
  AlertCircle,
  Bell,
  Trash2,
  Save
} from 'lucide-react';
import { useEventContext } from '../contexts/EventContext';
import { CalendarEvent } from '../contexts/EventContext';
import toast from 'react-hot-toast';
import './EventModal.css';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: CalendarEvent | null;
  selectedDate?: Date | null;
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  event,
  selectedDate,
}) => {
  const { addEvent, updateEvent, deleteEvent } = useEventContext();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    category: 'work' as const,
    priority: 'medium' as const,
    reminder: 15,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        category: event.category,
        priority: event.priority,
        reminder: event.reminder || 15,
      });
    } else if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        date: format(selectedDate, 'yyyy-MM-dd'),
      }));
    } else {
      const today = new Date();
      setFormData(prev => ({
        ...prev,
        date: format(today, 'yyyy-MM-dd'),
      }));
    }
  }, [event, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form
      if (!formData.title.trim()) {
        toast.error('Event title is required');
        return;
      }

      if (!formData.date) {
        toast.error('Event date is required');
        return;
      }

      if (!formData.startTime || !formData.endTime) {
        toast.error('Start and end times are required');
        return;
      }

      // Check if end time is after start time
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`);
      
      if (endDateTime <= startDateTime) {
        toast.error('End time must be after start time');
        return;
      }

      if (event) {
        // Update existing event
        updateEvent(event.id, formData);
      } else {
        // Create new event
        addEvent(formData);
      }

      onClose();
      resetForm();
    } catch (error) {
      toast.error('Failed to save event');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (event && window.confirm('Are you sure you want to delete this event?')) {
      deleteEvent(event.id);
      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: '',
      endTime: '',
      category: 'work',
      priority: 'medium',
      reminder: 15,
    });
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'reminder' ? parseInt(value) : value,
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="modal-backdrop"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="modal-content"
        >
          {/* Header */}
          <div className="modal-header">
            <h2 className="modal-title">
              {event ? 'Edit Event' : 'Create New Event'}
            </h2>
            <div className="modal-actions">
              {event && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDelete}
                  className="delete-button"
                >
                  <Trash2 size={20} />
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClose}
                className="close-button"
              >
                <X size={20} />
              </motion.button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="modal-form">
            {/* Title */}
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                <Type size={16} />
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="input"
                placeholder="Enter event title"
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="description" className="form-label">
                <FileText size={16} />
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="input textarea"
                placeholder="Enter event description (optional)"
              />
            </div>

            {/* Date */}
            <div className="form-group">
              <label htmlFor="date" className="form-label">
                <Calendar size={16} />
                Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="input"
              />
            </div>

            {/* Time */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startTime" className="form-label">
                  <Clock size={16} />
                  Start Time *
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                  className="input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="endTime" className="form-label">
                  <Clock size={16} />
                  End Time *
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  required
                  className="input"
                />
              </div>
            </div>

            {/* Category and Priority */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category" className="form-label">
                  <Tag size={16} />
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="input select"
                >
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                  <option value="health">Health</option>
                  <option value="social">Social</option>
                  <option value="travel">Travel</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="priority" className="form-label">
                  <AlertCircle size={16} />
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="input select"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* Reminder */}
            <div className="form-group">
              <label htmlFor="reminder" className="form-label">
                <Bell size={16} />
                Reminder (minutes before)
              </label>
              <select
                id="reminder"
                name="reminder"
                value={formData.reminder}
                onChange={handleInputChange}
                className="input select"
              >
                <option value={0}>No reminder</option>
                <option value={5}>5 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
                <option value={1440}>1 day</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleClose}
                className="btn btn-secondary"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="btn btn-primary submit-btn"
              >
                {isLoading ? (
                  <div className="loading-spinner" />
                ) : (
                  <>
                    <Save size={16} />
                    <span>{event ? 'Update' : 'Create'} Event</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EventModal;