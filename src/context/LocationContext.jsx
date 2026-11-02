import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useNotification } from './NotificationContext';
import { getEventLocations } from '../services/masterDataService';

const LocationContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useLocations = () => useContext(LocationContext);

export const LocationProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [locationData, setLocationData] = useState([]);
  const { showNotification } = useNotification();
  const showNotificationRef = useRef(showNotification);

  useEffect(() => {
    showNotificationRef.current = showNotification;
  }, [showNotification]);

  const loadLocations = useCallback(async () => {
    setLoading(true);
    try {
      const locations = await getEventLocations();
      setLocationData(locations);
    } catch (error) {
      showNotificationRef.current(
        'Error al cargar Ubicaciones',
        error?.response?.data?.message ?? error.message,
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <LocationContext.Provider value={{ loading, locationData, loadLocations }}>
      {children}
    </LocationContext.Provider>
  );
};
