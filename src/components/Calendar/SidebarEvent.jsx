import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function SidebarEvent({ event, isSelected, onSelectEvent }) {
  const { user } = useAuth();
  const canViewEvents = user?.permissions?.includes('view-events');
  const routePath = event?.extendedProps?.routePath;

  // Obtener la clase CSS del evento
  const eventColorClass = event.classNames?.[0] || event.className || 'g-calendar-ve-holidays';
  
  return (
    <li 
      className={`sidebar-event-item ${isSelected ? `border-${eventColorClass}` : ''}`} 
      onClick={() => onSelectEvent(event)}
      style={{ cursor: 'pointer' }}
    >
      <div className="sidebar-event-content">
        <div 
          className={`event-color-indicator ${eventColorClass}`}
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            display: 'inline-block',
            marginRight: '10px',
            flexShrink: 0
          }}
        />
        <span>
          {canViewEvents && routePath ? (
            <Link className="event-title" to={routePath}>
              {event.title}
            </Link>
          ) : (
            <span className="event-title">{event.title}</span>
          )}
        </span>
      </div>
    </li>
  );
}
