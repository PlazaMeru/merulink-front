import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { getDepartments, getEventCategories, getEventLocations, getEmployeesByDept } from '../services/masterDataService';
import { useNotification } from "../context/NotificationContext"; 
import { useAuth } from '../context/AuthContext';

const GlobalDataContext = createContext();

export const GlobalDataProvider = ({ children }) => {
  
  const [departments, setDepartments] = useState([]);
  const [departmentsLoaded, setDepartmentsLoaded] = useState(false);
  const [subDepartments, setSubDepartments] = useState([]);
  const [categoryEvents, setCategoryEvents] = useState([]);
  const [locations, setLocations] = useState([]);
  const [globalLoading, setGlobalLoading] = useState(false);
  const { user } = useAuth();
  const loadingRef = useRef(false);

  // Cargar departamentos automáticamente al montar el provider
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadDepartments();
    }
  }, []);

  const loadDepartments = useCallback(async () => {
    if (loadingRef.current) return; // Evitar llamadas concurrentes
    loadingRef.current = true;
    setGlobalLoading(true);
    try {
      const depRes = await getDepartments();
      setDepartments(depRes);
      setDepartmentsLoaded(true);
    } catch (error) {
      console.error("Error cargando departamentos:", error);
    } finally {
      setGlobalLoading(false);
      loadingRef.current = false;
    }
  }, []);

  // Deja solo los departamentos que el usuario tiene asignados. 
  // Si no tiene asignado, cae a su propio departamento.
  const filteredDepartments = useMemo(() => {
    if (!departmentsLoaded || !user) return [];

    const assigned = Array.isArray(user.departments)
      ? user.departments.map(Number)
      : [];
    const allowedIds =
      assigned.length > 0
        ? assigned
        : user.departmentId
          ? [Number(user.departmentId)]
          : [];

    if (allowedIds.length === 0) return [];

    return departments.filter((dept) => allowedIds.includes(Number(dept.id)));
  }, [departments, departmentsLoaded, user]);

  // *** Setters para mantener el estado global actualizado

  // Departamento ***
  const addDepartmentGlobalState = (addDep) => {
    console.log("addDep", addDep)
    setDepartments(prevData => [addDep, ...prevData]);
  };

  // Departamento ***
  const updateDepartmentGlobalState = (updatedDep) => {
    setDepartments(prevData => {
      const filteredData = prevData.filter(department => department.id !== updatedDep.id);
      return [updatedDep, ...filteredData];
    });
  };

  
  // Sub-Departamento ***
  const addSubDepartmentGlobalState = (addSubDep) => {
    setDepartments(prevDepartments => {
      return prevDepartments.map(dep => {
        // Buscar departamento dueño del nuevo subdepartamento
        if (Number(dep.id) === Number(addSubDep.department.id)) {
          return {
            ...dep,
            subDepartments: [...dep.subDepartments, addSubDep.subDepartment]
          };
        }      
        return dep;
      });
    });
  };

  // Sub-Departamento ***
  const updateSubDepartmentGlobalState = (updatedSubDep) => {
    setDepartments(prevDepartments => {
      return prevDepartments.map(dep => {
        // Validar ID del departamento
        if (Number(dep.id) === Number(updatedSubDep.department.id)) {
          
          return {
            ...dep,
            subDepartments: dep.subDepartments.map(sub => {

              const targetId = updatedSubDep.subDepartment?.id;
              if (Number(sub.id) === Number(targetId)) {
                return updatedSubDep.subDepartment;
              }
              return sub;
            })
          };
        }
        return dep;
      });
    });
  };


  // Cargo ***
  const addPositionGlobalState = (addPosition, isAddingSubDepartment) => {

    if (isAddingSubDepartment) {
      addSubDepartmentGlobalState(addPosition);
    }

    setDepartments(prevDepartments => {
      return prevDepartments.map(dep => {
        // Buscar departamento dueño del nuevo cargo
        if (Number(dep.id) === Number(addPosition?.department.id)) {
          return {
            ...dep,
            positions: [...dep.positions, addPosition]
          };
        }      
        return dep;
      });
    });
  };

  
  // Cargo ***
  const updatePositionGlobalState = (updatedPosition, isAddingSubDepartment) => {

    if (isAddingSubDepartment) addSubDepartmentGlobalState(updatedPosition);

    setDepartments(prevDepartments => {
      return prevDepartments.map(dep => {
        // Validar ID del departamento
        if (Number(dep.id) === Number(updatedPosition.department.id)) {        
          return {
            ...dep,
            positions: dep.positions.map(pos => {
         
              const targetId = updatedPosition?.id;
              if (Number(pos.id) === Number(targetId)) {
                return updatedPosition;
              }
              return pos;
            })
          };
        }
        return dep;
      });
    });
  };

  const addLocationGlobalState = (location) => {
    setLocations((currentLocations) => [
      ...currentLocations.filter((item) => item.id !== location.id),
      location,
    ]);
  };

  const updateLocationGlobalState = (updatedLocation) => {
    setLocations((currentLocations) =>
      currentLocations.map((location) =>
        location.id === updatedLocation.id ? updatedLocation : location
      )
    );
  };

  const removeLocationGlobalState = (locationId) => {
    setLocations((currentLocations) =>
      currentLocations.filter((location) => location.id !== locationId)
    );
  };

  const loadEventCategories = async () => {
    setGlobalLoading(true);
    try {
      
      const res = await getEventCategories();
      // console.log("GetEventCategory", res);
      setCategoryEvents(res);
    } catch (error) {
      console.error("Error cargando Categorías de eventos:", error);
    } finally {
      setGlobalLoading(false);
    }
  };

  const getLocations = async () => {
    setGlobalLoading(true);
    try {
      
      const res = await getEventLocations();
      // console.log("getEventLocations", res);
      setLocations(res);
    } catch (error) {
      console.error("Error cargando Localizaciones:", error);
    } finally {
      setGlobalLoading(false);
    }
  };

  // const getEmployeesByDepartment = async (departmentId, start, end) => {
  //   try {      
  //     const res = await getEmployeesByDept(departmentId, start, end);
  //     // console.log("RES getEmployees", res);
  //     return res;
  //   } catch (error) {
  //     console.error("Error cargando empleados por departamento:", error);
  //   }
  // };

  const contextValue = {
    departments, 
    setDepartments,
    filteredDepartments,
    departmentsLoaded,
    subDepartments, 
    globalLoading, 
    loadDepartments, 
    addDepartmentGlobalState,
    updateDepartmentGlobalState,
    addSubDepartmentGlobalState, 
    updateSubDepartmentGlobalState,
    addPositionGlobalState,
    updatePositionGlobalState,
    loadEventCategories,
    categoryEvents,
    getLocations,
    locations,
    addLocationGlobalState,
    updateLocationGlobalState,
    removeLocationGlobalState,
    // getEmployeesByDepartment
  };

  return (
    <GlobalDataContext.Provider value={contextValue}>
      {children}
    </GlobalDataContext.Provider>
  );
};

export const useGlobalData = () => useContext(GlobalDataContext);