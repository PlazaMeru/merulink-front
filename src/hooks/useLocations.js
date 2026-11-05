/*import { useDepartments } from '../context/DepartmentContext';
import { locations } from '../utils/StaticData/location-utils';

export const useLocationsHook = () => {

    const getLocationById = (locationId) => {
        const location = locations.find(loc => String(loc.id) === String(locationId));
        return location ? location : { locationName: null, id: null };
    };

    return { getLocationById };
};*/