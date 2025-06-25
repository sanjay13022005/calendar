import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Plus, 
  Bell, 
  Search, 
  User, 
  LogOut, 
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNotificationContext } from '../contexts/NotificationContext';
import { useEventContext } from '../contexts/EventContext';
import './Header.css';

interface HeaderProps {
  onCreateEvent: () => void;
  onToggleNotifications: () => void;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onCreateEvent, 
  onToggleNotifications,
  onToggleSidebar 
}) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotificationContext();
  const { searchEvents } = useEventContext();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsSearching(true);
      const results = searchEvents(query);
      setSearchResults(results);
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="header glass"
    >
      <div className="header-content">
        <div className="header-left">
          <div className="header-brand">
            <div className="brand-logo">
              <Calendar className="brand-icon" />
            </div>
            <div className="brand-text">
              <h1 className="brand-title">Calendar Pro</h1>
              <p className="brand-subtitle">Welcome, {user?.name}</p>
            </div>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="header-search">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
          </div>
          
          {/* Search Results */}
          {isSearching && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="search-results"
            >
              {searchResults.length > 0 ? (
                <div className="search-results-list">
                  {searchResults.map((event) => (
                    <div
                      key={event.id}
                      className="search-result-item"
                    >
                      <div className="search-result-title">{event.title}</div>
                      <div className="search-result-meta">
                        {new Date(event.date).toLocaleDateString()} at {event.startTime}
                      </div>
                      <div className="search-result-author">
                        Created by {event.createdByName}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="search-no-results">
                  No events found
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Right Section */}
        <div className="header-right">
          {/* Sidebar Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleSidebar}
            className="header-button"
          >
            <Menu size={20} />
          </motion.button>

          {/* Create Event Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCreateEvent}
            className="btn btn-primary create-event-btn"
          >
            <Plus size={16} />
            <span className="create-event-text">New Event</span>
          </motion.button>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleNotifications}
            className="header-button notification-button"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="notification-badge"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </motion.button>

          {/* User Menu */}
          <div className="user-menu">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="user-button"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="user-avatar"
                />
              ) : (
                <User size={20} />
              )}
              <span className="user-name">{user?.name}</span>
            </motion.button>

            {/* User Dropdown */}
            {isUserMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="user-dropdown"
              >
                <div className="user-info">
                  <p className="user-info-name">{user?.name}</p>
                  <p className="user-info-email">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="logout-button"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close search and user menu */}
      {(isSearching || isUserMenuOpen) && (
        <div
          className="header-overlay"
          onClick={() => {
            setIsSearching(false);
            setSearchQuery('');
            setSearchResults([]);
            setIsUserMenuOpen(false);
          }}
        />
      )}
    </motion.header>
  );
};

export default Header;