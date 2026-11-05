import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocations } from '../../context/LocationContext';
import ButtonDelete from '../Shared/ButtonDelete';
import ConfirmDialog from '../Shared/ConfirmDialog';
import HasPermission from '../Shared/HasPermission';

export default function LocationRow({ location, rowClassName = '', chunk }) {
  const navigate = useNavigate();
  const { deleteLocation } = useLocations();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasEvents = Number(location.eventsCount) > 0;

  const handleConfirmDelete = async () => {
    await deleteLocation(location);
  };

  return (
    <tr
      data-chunk={chunk}
      onClick={() => navigate(`/eventos/ubicaciones/ver/${location.id}`)}
      className={`border-b tr-table hover:bg-blue-50 transition-colors duration-150 cursor-pointer ${rowClassName}`}
    >
      <td className="px-4 py-3 text-white-800 font-medium">{location.area}</td>
      <td className="px-4 py-3 text-white-700">{location.floor}</td>
      <td className="px-4 py-3 text-white-700">{location.referencePoint}</td>
      <td className="px-4 py-3">
        <HasPermission permissions={['delete-locations']}>
          <>
            <ButtonDelete
              setIsModalOpen={() => setIsModalOpen(true)}
              title={hasEvents ? 'No se puede eliminar: hay eventos asociados' : 'Eliminar'}
              disabled={hasEvents}
              dynamicClasses={hasEvents ? 'cursor-not-allowed opacity-50' : ''}
            />
            <ConfirmDialog
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onConfirm={handleConfirmDelete}
              title="Eliminar Ubicación"
              message={`¿Está seguro que desea eliminar la ubicación "${location.area}"?`}
            />
          </>
        </HasPermission>
      </td>
    </tr>
  );
}