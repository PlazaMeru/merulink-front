import dayjs from 'dayjs';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Palmtree } from "lucide-react";
import { useAuth } from '../../context/AuthContext';

import { getStatusColor, getStatusName } from '../../utils/status-utils';  

import ChangeStatusModal from './modals/ChangeStatusModal';
import AbsenceModal from './modals/AbsenceModal';
import EmployeeStatusDetailsModal from './modals/EmployeeStatusDetailsModal';
import useChangeStatusModal from '../../hooks/useChangeStatusModal';
import HasPermission from '../Shared/HasPermission';

function EmployeeTopBar({ createMode, editMode, viewMode, setShowScraperModal, setScraperKey, employee, loadingChangeStatus  }) {
  const { user } = useAuth();
  const [isAbsenceOpen, setIsAbsenceOpen] = useState(false);
  const { isModalOpen, openChangeStatus, confirmChangeStatus, closeChangeStatus } = useChangeStatusModal();

  const canChangeStatus = user?.permissions?.includes('change-status-employees');

  return (
    <div className="w-full md:w-auto flex flex-wrap justify-center md:justify-end items-center gap-3 mt-3 md:mt-0 border-b border-[#ffffff21] pb-3">
      {createMode && (
        <Link
          onClick={() => { setShowScraperModal(true); setScraperKey(k => k + 1); }}
          className="flex items-center gap-1 text-sm text-[#9fd8ff]! hover:text-white! transition-colors font-medium mr-5"
        >
          <Search className="w-4 h-4 text-[#9fd8ff]" /> Traer Datos
        </Link>
      )}
      
      {(editMode || viewMode) && (
        <>
          <div className="flex items-stretch gap-3">
            <HasPermission permissions={['manage-absences-tab-employees']} >
              <div className="flex flex-col items-end justify-center gap-2 bg-[#50575b87] border border-[#ffffff21] rounded-lg py-2 px-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAbsenceOpen(true);
                    }}
                    title="Registrar ausencia"
                    aria-label="Registrar ausencia"
                    className="skip-style-btn flex items-center justify-center w-8 h-8 rounded-full bg-gray-300 hover:bg-gray-200 text-gray-700 transition-colors"
                  >
                    <Palmtree className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </HasPermission>

            <div className="flex flex-col items-end justify-center gap-2 bg-[#50575b87] border border-[#ffffff21] rounded-lg py-2 px-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">Estatus:</span>
                {loadingChangeStatus.loading ? (
                  <SpanText />
                ) : (
                  <span
                    className={`status-tag ${getStatusColor(employee?.status)}`}
                    onClick={canChangeStatus && !employee?.scheduledDeactivation ? (e) => {
                      e.stopPropagation();
                      openChangeStatus(employee);
                    } : undefined}
                  >
                    {getStatusName(employee?.status)}
                  </span>
                )}
              </div>
            </div>
          </div>

            <div className="w-full flex justify-center md:justify-end">
              {!loadingChangeStatus.loading && employee?.status === false ? (
                <EmployeeStatusDetailsModal employee={employee}>
                  <span title="Detalles Estatus">Razón: {employee?.latestPeriod?.retireReason} desde {dayjs(employee?.latestPeriod?.retireDate).format('DD/MM/YYYY')} </span> 
                </EmployeeStatusDetailsModal>
              ) : (
                employee?.scheduledDeactivation && (
                  <span className="group relative text-xs font-medium text-yellow-300 bg-yellow-500/15 border border-yellow-500/30 rounded-md px-2.5 py-1 text-center whitespace-nowrap">
                    Desactivación programada: {dayjs(employee?.latestPeriod?.scheduledDeactivateDate).format('DD/MM/YYYY')}
                  </span>
                )
              )}
            </div>
            
          

          <ChangeStatusModal
            isOpen={isModalOpen}
            onClose={closeChangeStatus}
            onConfirm={confirmChangeStatus}
            employee={employee}
            onLoadingChangeStatus={loadingChangeStatus}
          />

          <AbsenceModal
            isOpen={isAbsenceOpen}
            onClose={() => setIsAbsenceOpen(false)}
            employee={employee}
          />
        </>
      )}
    </div>
  );
}

export default EmployeeTopBar;