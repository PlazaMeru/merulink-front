import { createContext, useCallback, useContext, useState } from 'react';
import { useNotification } from './NotificationContext';
import { getEventLocations, getLocationById } from '../services/masterDataService';
import { useGlobalData } from './GlobalDataContext';
import axios from 'axios';
import { ENV } from '../config/env';

const LocationContext = createContext(null);

export const useLocations = () => useContext(LocationContext);

export const LocationProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [locationData, setLocationData] = useState([]);
  const { showNotification } = useNotification();
  const { addLocationGlobalState, updateLocationGlobalState } = useGlobalData();

  const loadLocations = useCallback(async () => {
    setLoading(true);
    try {
      const locations = await getEventLocations();
      setLocationData(locations);
    } catch (error) {
      showNotification('Error al cargar Ubicaciones', error?.response?.data?.message ?? error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLocationById = useCallback(async (id) => {
    setLoading(true);
    try {
      return await getLocationById(id);
    } catch (error) {
      showNotification('Error al cargar Ubicación', error?.response?.data?.message ?? error.message, 'error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createLocation = async (formData) => {
    try {
      const response = await axios.post(`${ENV.API_BACK_URL}locations`, formData);
      const location = response.data.data;
      addLocationGlobalState(location);
      showNotification('Ubicación creada', `${location.area} creada con éxito`, 'success');
      return true;
    } catch (error) {
      showNotification('Error al crear ubicación', error?.response?.data?.message ?? error.message, 'error');
      return false;
    }
  };

  const updateLocation = async (formData) => {
    try {
      if (!formData.id) {
        showNotification('Error al actualizar ubicación', 'No se encontró el ID de la ubicación.', 'error');
        return false;
      }

      const response = await axios.put(`${ENV.API_BACK_URL}locations/${formData.id}`, {
        area: formData.area,
        floor: formData.floor,
        reference_point: formData.reference_point,
      });
      const location = response.data.data;
      updateLocationGlobalState(location);
      showNotification('Ubicación actualizada', `${location.area} actualizada con éxito`, 'success');
      return true;
    } catch (error) {
      showNotification('Error al actualizar ubicación', error?.response?.data?.message ?? error.message, 'error');
      return false;
    }
  };

  return (
    <LocationContext.Provider
      value={{
        loading,
        locationData,
        loadLocations,
        loadLocationById,
        createLocation,
        updateLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};
