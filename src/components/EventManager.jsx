import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, Ticket, Plus, Edit, Trash2, Eye, Download } from 'lucide-react';
import { EVENT_TYPES, EVENT_STATUSES } from '../utils/constants';
import { formatDate, formatDateTime } from '../utils/helpers';
import toast from 'react-hot-toast';

function EventManager({ userRole }) {
  const [events, setEvents] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_type: '',
    start_date: '',
    end_date: '',
    location: '',
    capacity: '',
    ticket_types: [],
    visibility: 'public',
    house_id: null
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // This would fetch from the backend
      const mockEvents = [
        {
          id: 1,
          title: 'Spring Ball 2024',
          description: 'Annual spring ballroom competition and celebration',
          event_type: 'Ball',
          start_date: '2024-03-15T19:00:00Z',
          end_date: '2024-03-15T23:00:00Z',
          location: 'Grand Ballroom, Downtown',
          capacity: 500,
          current_attendees: 342,
          status: 'upcoming',
          ticket_types: [
            { id: 1, name: 'General Admission', price: 2500, sold: 200, available: 300 },
            { id: 2, name: 'VIP Access', price: 7500, sold: 50, available: 100 },
            { id: 3, name: 'Backstage Pass', price: 15000, sold: 20, available: 50 }
          ],
          revenue: 1250000, // $12,500.00
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: 2,
          title: 'Vogue Workshop',
          description: 'Learn vogue techniques from professional dancers',
          event_type: 'Workshop',
          start_date: '2024-02-20T14:00:00Z',
          end_date: '2024-02-20T17:00:00Z',
          location: 'Dance Studio A',
          capacity: 50,
          current_attendees: 35,
          status: 'upcoming',
          ticket_types: [
            { id: 4, name: 'Workshop Ticket', price: 5000, sold: 35, available: 50 }
          ],
          revenue: 175000, // $1,750.00
          created_at: '2024-01-10T09:00:00Z'
        }
      ];
      setEvents(mockEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // This would create the event via API
      const eventData = {
        ...newEvent,
        id: Date.now(),
        status: 'upcoming',
        current_attendees: 0,
        revenue: 0,
        created_at: new Date().toISOString()
      };
      
      setEvents(prev => [eventData, ...prev]);
      setShowCreateModal(false);
      setNewEvent({
        title: '',
        description: '',
        event_type: '',
        start_date: '',
        end_date: '',
        location: '',
        capacity: '',
        ticket_types: [],
        visibility: 'public',
        house_id: null
      });
      toast.success('Event created successfully!');
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      setEvents(prev => prev.filter(event => event.id !== eventId));
      toast.success('Event deleted successfully!');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'Ball':
        return <Calendar className="w-5 h-5" />;
      case 'Workshop':
        return <Users className="w-5 h-5" />;
      case 'Practice':
        return <Clock className="w-5 h-5" />;
      case 'Competition':
        return <Ticket className="w-5 h-5" />;
      default:
        return <Calendar className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatRevenue = (revenue) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(revenue / 100);
  };

  const filteredEvents = events.filter(event => {
    if (activeTab === 'upcoming') return event.status === 'upcoming';
    if (activeTab === 'ongoing') return event.status === 'ongoing';
    if (activeTab === 'completed') return event.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Event Management</h2>
          <p className="text-gray-600">Create and manage ballroom events</p>
        </div>
        
        {(userRole === 'Leader' || userRole === 'Admin') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {['upcoming', 'ongoing', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} Events
            </button>
          ))}
        </nav>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeTab} events</h3>
          <p className="text-gray-600">
            {activeTab === 'upcoming' ? 'Create your first event to get started' : 'No events found'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Event Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {getEventTypeIcon(event.event_type)}
                    <span className="text-sm font-medium text-gray-600">{event.event_type}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>

                {/* Event Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>

                {/* Event Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDateTime(event.start_date)}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    {event.current_attendees} / {event.capacity} attendees
                  </div>
                </div>

                {/* Revenue */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Revenue</span>
                    <span className="text-lg font-bold text-green-600">{formatRevenue(event.revenue)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {(userRole === 'Leader' || userRole === 'Admin') && (
                      <>
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                          title="Edit Event"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                  
                  <button className="btn-primary text-sm">
                    <Ticket className="w-4 h-4 mr-1" />
                    Manage Tickets
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Event</h3>
            
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                  <select
                    value={newEvent.event_type}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, event_type: e.target.value }))}
                    className="input-field"
                    required
                  >
                    <option value="">Select Event Type</option>
                    {EVENT_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={newEvent.start_date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, start_date: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={newEvent.end_date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, end_date: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={newEvent.capacity}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, capacity: e.target.value }))}
                    className="input-field"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{selectedEvent.title}</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Event Details */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Event Details</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Description:</span>
                    <p className="text-sm text-gray-900 mt-1">{selectedEvent.description}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Type:</span>
                    <p className="text-sm text-gray-900 mt-1">{selectedEvent.event_type}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Location:</span>
                    <p className="text-sm text-gray-900 mt-1">{selectedEvent.location}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Capacity:</span>
                    <p className="text-sm text-gray-900 mt-1">{selectedEvent.current_attendees} / {selectedEvent.capacity}</p>
                  </div>
                </div>
              </div>

              {/* Ticket Types */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Ticket Types</h4>
                <div className="space-y-3">
                  {selectedEvent.ticket_types.map((ticket) => (
                    <div key={ticket.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{ticket.name}</span>
                        <span className="text-sm font-bold text-green-600">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD'
                          }).format(ticket.price / 100)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{ticket.sold} sold</span>
                        <span>{ticket.available} available</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-600">Total Revenue:</span>
                  <p className="text-lg font-bold text-green-600">{formatRevenue(selectedEvent.revenue)}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="btn-primary">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </button>
                  <button className="btn-primary">
                    <Ticket className="w-4 h-4 mr-2" />
                    Manage Tickets
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventManager;