import dayjs from 'dayjs';
import CenteredInfoModal from '../../Shared/CenteredInfoModal';
import LabelFieldForm from '../../Shared/LabelFieldForm';

export default function EmployeeStatusDetailsModal({ employee, children }) {
  const period = employee?.latestPeriod;

  return (
    <CenteredInfoModal
      title="Detalles Estatus"
      contentClassName="grid min-w-[min(32rem,calc(90vw-5rem))] gap-4 whitespace-normal text-sm text-gray-100"
      triggerClassName="text-xs font-medium text-red-300 bg-red-500/15 border border-red-500/30 rounded-md px-2.5 py-1 text-center whitespace-nowrap"
      content={
        <>
          <div>
            <LabelFieldForm field="Último día laborado" />
            <div className="rounded-lg border border-[#ffffff21] bg-[#252729] px-3 py-2.5">
              {period?.retireDate
                ? dayjs(period.retireDate).format('DD/MM/YYYY')
                : 'Sin información'}
            </div>
          </div>
          <div>
            <LabelFieldForm field="Tipo de egreso" />
            <div className="rounded-lg border border-[#ffffff21] bg-[#252729] px-3 py-2.5">
              {period?.retireReason || 'Sin información'}
            </div>
          </div>
          <div>
            <LabelFieldForm field="Motivo / Observaciones" />
            <div className="min-h-12 rounded-lg border border-[#ffffff21] bg-[#252729] px-3 py-2.5">
              {period?.retireNote || 'Sin información'}
            </div>
          </div>
        </>
      }
    >
      {children}
    </CenteredInfoModal>
  );
}
