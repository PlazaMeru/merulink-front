import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';

import { locationValidationSchema } from '../../utils/Validations/locationValidationSchema';
import { useLocations } from '../../context/LocationContext';
import FooterFormButtons from '../Shared/FooterFormButtons';
import HeadFormButtons from '../Shared/HeadFormButtons';
import LabelFieldForm from '../Shared/LabelFieldForm';
import ErrorMessage from '../Shared/ErrorMessage';
import TitleHeader from '../Shared/TitleHeader';
import HasPermission from '../Shared/HasPermission';
import LoadingSpinner from '../Shared/LoadingSpinner';

import '../../Tables.css';

const emptyLocation = {
  area: '',
  floor: '',
  reference_point: '',
};

export default function LocationForm({ mode = 'create' }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { loadLocationById, createLocation, updateLocation } = useLocations();
  const [locationResult, setLocationResult] = useState({
    id: null,
    location: null,
    error: '',
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(locationValidationSchema),
    defaultValues: emptyLocation,
  });

  const createMode = mode === 'create';
  const viewMode = mode === 'view';
  const editMode = mode === 'edit';
  const locationId = Number(id);
  const location = locationResult.id === locationId ? locationResult.location : null;
  const loadingLocation = !createMode && locationResult.id !== locationId;
  const loadError = createMode ? '' : locationResult.error;

  useEffect(() => {
    let active = true;

    if (createMode) {
      reset(emptyLocation);
      return () => {
        active = false;
      };
    }

    loadLocationById(id)
      .then((loadedLocation) => {
        if (!active) return;

        setLocationResult({
          id: Number(id),
          location: loadedLocation,
          error: loadedLocation ? '' : 'No se pudo cargar la ubicación solicitada.',
        });
        if (loadedLocation) {
          reset({
            area: loadedLocation.area ?? '',
            floor: loadedLocation.floor ?? '',
            reference_point: loadedLocation.reference_point ?? '',
          });
        }
      })
      .catch(() => {
        if (active) {
          setLocationResult({
            id: Number(id),
            location: null,
            error: 'No se pudo cargar la ubicación solicitada.',
          });
        }
      });

    return () => {
      active = false;
    };
  }, [createMode, id, loadLocationById, mode, reset]);

  const onSubmit = async (data) => {
    const success = editMode
      ? await updateLocation({ ...data, id: location?.id })
      : await createLocation(data);

    if (success) navigate('/eventos/ubicaciones');
  };

  const onError = (formErrors) => {
    console.warn('LocationForm validation errors:', formErrors);
  };

  return (
    <div className="w-full max-w-7xl mx-auto overflow-x-auto p-2 rounded-lg">
      {viewMode && location && (
        <HasPermission permissions={['edit-locations']}>
          <HeadFormButtons url={`/eventos/ubicaciones/editar/${location.id}`} data={[]} />
        </HasPermission>
      )}

      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <div className="table-container rounded-lg mt-4 shadow-md p-6 w-full overflow-auto">
          <TitleHeader
            title={editMode ? 'Editar Ubicación' : 'Datos de la Ubicación'}
            dynamicClasses="!mb-5"
          />

          {loadingLocation ? (
            <LoadingSpinner />
          ) : loadError ? (
            <>
              <ErrorMessage msg={loadError} />
              <FooterFormButtons mode="view" navigate={navigate} />
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-3 div-border">
                <div>
                  <LabelFieldForm field="Zona / Área" simbol="*" />
                  <input
                    type="text"
                    readOnly={viewMode}
                    {...register('area')}
                    placeholder="Ingrese la zona o área"
                    className={`input-dark ${viewMode ? 'cursor-not-allowed opacity-50' : ''}`}
                  />
                  {errors.area && <ErrorMessage msg={errors.area.message} />}
                </div>

                <div>
                  <LabelFieldForm field="Nivel / Planta" simbol="*" />
                  <input
                    type="text"
                    readOnly={viewMode}
                    {...register('floor')}
                    placeholder="Ingrese el nivel o planta"
                    className={`input-dark ${viewMode ? 'cursor-not-allowed opacity-50' : ''}`}
                  />
                  {errors.floor && <ErrorMessage msg={errors.floor.message} />}
                </div>

                <div className="md:col-span-2">
                  <LabelFieldForm field="Punto de referencia" />
                  <input
                    type="text"
                    readOnly={viewMode}
                    {...register('reference_point')}
                    placeholder="Ingrese un punto de referencia (opcional)"
                    className={`input-dark ${viewMode ? 'cursor-not-allowed opacity-50' : ''}`}
                  />
                  {errors.reference_point && (
                    <ErrorMessage msg={errors.reference_point.message} />
                  )}
                </div>

                {location && (
                  <div className="md:col-span-2">
                    <LabelFieldForm field="Clave generada" />
                    <p className="text-gray-300">{location.key}</p>
                  </div>
                )}
              </div>

              <FooterFormButtons
                isSubmitting={isSubmitting}
                mode={mode}
                navigate={navigate}
                permissions={['create-locations', 'edit-locations']}
                txtCreate="Ubicación"
              />
            </>
          )}
        </div>
      </form>
    </div>
  );
}
