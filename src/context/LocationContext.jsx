import { createContext, useCallback, useContext, useState } from 'react';
import { useNotification } from './NotificationContext';
import { getEventLocations, getLocationById } from '../services/masterDataService';
import { useGlobalData } from './GlobalDataContext';
import { mapLocationToBackend } from '../utils/mappers/locationMapper';
import axios from 'axios';
import { ENV } from '../config/env';

const LocationContext = createContext(null);

export const useLocations = () => useContext(LocationContext);

export const LocationProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [locationData, setLocationData] = useState([]);
  const { showNotification } = useNotification();
  const { addLocationGlobalState, updateLocationGlobalState, removeLocationGlobalState } = useGlobalData();

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
      const response = await axios.post(`${ENV.API_BACK_URL}locations`, mapLocationToBackend(formData));
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

      const response = await axios.put(`${ENV.API_BACK_URL}locations/${formData.id}`, mapLocationToBackend(formData));
      const location = response.data.data;
      updateLocationGlobalState(location);
      showNotification('Ubicación actualizada', `${location.area} actualizada con éxito`, 'success');
      return true;
    } catch (error) {
      showNotification('Error al actualizar ubicación', error?.response?.data?.message ?? error.message, 'error');
      return false;
    }
  };

  const deleteLocation = async (location) => {
    try {
      await axios.delete(`${ENV.API_BACK_URL}locations/${location.id}`);
      setLocationData((current) => current.filter((item) => item.id !== location.id));
      removeLocationGlobalState(location.id);
      showNotification('Ubicación eliminada', `${location.area} eliminada con éxito`, 'success');
      return true;
    } catch (error) {
      showNotification(
        'Error al eliminar ubicación',
        error?.response?.data?.message ?? error.message,
        'error'
      );
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
        deleteLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};
