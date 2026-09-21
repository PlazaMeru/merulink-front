import dayjs from 'dayjs';
import { forwardRef, useMemo, useState, useEffect, useCallback, useImperativeHandle } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';
import { useFormContext } from "react-hook-form";
import { useScheduleValidation } from '../../hooks/useScheduleValidation';
import { useGlobalData } from '../../context/GlobalDataContext';
import { useSchedules } from '../../context/ScheduleContext';

import { truncateText } from '../../utils/text-utils';
import { getDisabledClasses } from '../../utils/global-utils';
import { exportScheduleToPDF } from '../../utils/Schedule/exportPdf-utils';

import PreviousFortnightViewer from './viewers/PreviousFortnightViewer';
import HistoryViewer from './viewers/HistoryViewer';
import ScheduleWorkflowSteps from './ScheduleWorkflowSteps';
import ScheduleTopBar from '../Shared/ScheduleTopBar';
import ScheduleLegend from './ScheduleLegend';
import ShiftLegend from '../Shift/ShiftLegend';
import SpanText from '../Shared/SpanText';
import LiveAlerts from '../Shared/LiveAlerts';
import LabelFieldForm from '../Shared/LabelFieldForm';
import ErrorMessage from '../Shared/ErrorMessage';


ModuleRegistry.registerModules([AllCommunityModule]);

const CustomTooltip = (params) => {
  if (!params.value) return null;
  return (
    <div 
      className="custom-grid-tooltip-container"
      dangerouslySetInnerHTML={{ __html: params.value }}
    />
  );
};

const ScheduleGrid = forwardRef(({ 
  scheduleData, 
  preFortnightParams, 
  fortnightDays, 
  mode, 
  autofillAlways, 
  onAutofillAlwaysChange, 
  onLoadingHandleAutofill,
  onAutofillSuccess,
}, ref) => {

  const { register, formState: { errors } } = useFormContext();
  const { autofillSchedule, setLoading, setScheduleData } = useSchedules();
  const { departments, filteredDepartments } = useGlobalData();
  const [brushShift, setBrushShift] = useState(null);
  const [gridApi, setGridApi] = useState(null);
  const [liveAlerts, setLiveAlerts] = useState([]); 
  const [showPastFortnight, setShowPastFortnight] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { runLiveValidation, runShiftCoverageValidation } = useScheduleValidation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const viewMode = mode === 'view';
  const disabledClasses = getDisabledClasses(viewMode);
  const scheduleSaved = !!scheduleData?.id;
  const groupedEmployees = scheduleData?.employees;
  const shifts = scheduleData?.shifts;
  const hasAdministrativeShift = useMemo(() => shifts?.some(s => s.typeShift === 'administrative'), [shifts]);
  const cleanedShifts = useMemo(() => shifts?.filter(s => s.letterShift !== 'L') ?? [], [shifts]);
  const freeShift = useMemo(() => shifts?.find(s => s.id === 'S-0') ?? null, [shifts]);
  const isOneShift = cleanedShifts.length === 1;
  const titleFortnight = dayjs(scheduleData?.start).format('MMMM YYYY');

  // const daysMap = useMemo(() => {
  //   return fortnightDays.reduce((acc, curr) => {
  //     acc[curr.date] = curr;
  //     return acc;
  //   }, {});
  // }, [fortnightDays]);

  useEffect(() => {
    setBrushShift(null);
    setLiveAlerts(null);
    setShowPastFortnight(false);
    setShowHistory(false);
  }, [fortnightDays, scheduleData]);
  
  const onGridReady = (params) => {
    setGridApi(params.api);
  };

  const exportToPDF = async () => {
    await exportScheduleToPDF({
      elementId: 'merulink-grid-container',
      scheduleData,
      departments,
      setIsExporting,
    });
  };

  const handleCellClicked = (params) => {
    if (!brushShift) return;
    // Las filas separadoras de subdepartamento no se pintan con la brocha
    if (params.data?.isSubDepartmentHeader) return;

    const dateFieldName = params.column.getColId();
    const currentShiftId = params.value;

    // Si es baja/vacaciones/permiso bloquea que la brocha pinte encima
    if (currentShiftId === 'S-1' || currentShiftId === 'S-2' || currentShiftId === 'S-3') return;

    const updatedData = { ...params.data };

    // Extrae la fecha limpia quitando el prefijo 'date_'
    const rawDate = dateFieldName.replace('date_', '');

    if (currentShiftId === brushShift.id) {
      updatedData.dates[rawDate] = {
        ...updatedData.dates[rawDate],
        shift: {
          id: 'S-0',
          letterShift: 'L',
          color: '#535759',
          isSystemShift: true
        }
      };
    } else {
      updatedData.dates[rawDate] = {
        ...updatedData.dates[rawDate],
        shift: { ...brushShift }
      };
    }

    params.node.setData(updatedData);
    params.api.refreshCells({ rowNodes: [params.node], columns: [dateFieldName], force: true });

    // Disparar validación inmediatamente después de cambiar la celda activa
    if (gridApi) {
      const currentRows = [];
      gridApi.forEachNode(node => {
        if (!node.data.isSubDepartmentHeader) currentRows.push(node.data);
      });

      const liveAlerts = runLiveValidation(currentRows);
      const coverageAlerts = mode !== 'create' && !hasAdministrativeShift
        ? runShiftCoverageValidation(currentRows, cleanedShifts, fortnightDays) 
        : [];
      
        setLiveAlerts([...liveAlerts, ...coverageAlerts]);
    }
  };

  const collectGridPayload = useCallback(() => {
    if (!gridApi) return { shifts: shifts || [], schedules: [] };

    const schedulesBatch = [];
    gridApi.forEachNode((node) => {
      const row = node.data;
      if (row?.isSubDepartmentHeader) return;
      schedulesBatch.push({
        employeeId: row.id,
        subDepartmentId: row.subDepartment?.id || null,
        isVacation: !!row.vacation,
        dates: row.dates
      });
    });

    return { shifts: shifts || [], schedules: schedulesBatch };
  }, [gridApi, shifts]);

  useImperativeHandle(ref, () => ({
    collectGridPayload
  }), [collectGridPayload]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setBrushShift(freeShift);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [freeShift]);

  const myTheme = useMemo(() => {
    return themeQuartz.withParams({
      baseTheme: 'dark',
      accentColor: '#00A4BC', 
      backgroundColor: '#535557', 
      textColor: '#E0E0E0',
    });
  }, []); 
  
  const rowData = useMemo(() => {
    if (!groupedEmployees) return [];
    
    const flatRows = [];
    Object.keys(groupedEmployees).forEach((subDeptName) => {

      if (groupedEmployees[subDeptName].length === 0) return; // Evita agregar subdepartamentos sin empleados
      
      if (subDeptName !== '') {
        // Fila separadora (vacía) con el nombre del subdepartamento
        flatRows.push({
          isSubDepartmentHeader: true,
          subDepartmentName: subDeptName,
          fullName: subDeptName,
          id: `subdept-${subDeptName}`,
          dates: {},
        });
      }

      groupedEmployees[subDeptName].forEach((employee) => {
        flatRows.push({
          ...employee,
          fullName: `${employee.firstName} ${employee.lastName || ''}`.trim()
        });
      });
    });
    
    return flatRows;
  }, [groupedEmployees]);

  // Ejecutar la validación al renderizar por primera vez
  useEffect(() => {
    // Las filas separadoras de subdepartamento no participan en la validación
    const employeeRows = rowData.filter((row) => !row.isSubDepartmentHeader);
    if (employeeRows.length > 0) {
      const liveAlerts = runLiveValidation(employeeRows);
      const coverageAlerts = mode !== 'create' && !hasAdministrativeShift
        ? runShiftCoverageValidation(employeeRows, cleanedShifts, fortnightDays)
        : [];
      setLiveAlerts([...liveAlerts, ...coverageAlerts]);
    }
  }, [rowData]);

  const columnDefs = useMemo(() => {
    const baseCols = [
      { 
        headerName: 'Empleado', 
        field: 'fullName', 
        pinned: 'left', 
        width: window.innerWidth < 640 ? 110 : 180,
        cellClass: (params) => params.data?.isSubDepartmentHeader ? 'subdept-header-name' : '',
        cellRenderer: (params) => {
          if (params.data?.isSubDepartmentHeader) return params.data.subDepartmentName;
          const tags = [];
          if (params.data.permission) tags.push('🩺 Permiso');
          if (params.data.vacation) tags.push('🌴 Vacaciones');
          if (tags.length) return `${params.value} (${tags.join(' - ')})`;
          return params.value;
        }
      }
    ];

    const dayCols = fortnightDays.map((day) => {
      const hasHighlightedEventsForDay = rowData.some((row) => {
        return (row.dates?.[day.date]?.events || []).length > 0;
      });

      return {        
        headerName: `${day.dayName} ${day.dayNumber}`, 
        field: `date_${day.date}`, 
        
        headerComponent: () => (
          <div className="flex flex-col items-center justify-center py-1 w-full h-full text-center">
            <span className="text-[13px] uppercase font-bold tracking-tighter opacity-80 block">
              {day.dayName.substring(0, 3)} {/* Corta a 3 letras */}
            </span>

            <span className="text-xs font-bold block mt-0.5">
              {day.dayNumber}
            </span>
          </div>
        ),

        // Retorna el ID del shift asignado a esa fecha específica
        valueGetter: (params) => {
          if (params.data.isSubDepartmentHeader) return null;
          return params.data.dates?.[day.date]?.shift?.id ?? 'S-0';
        },

        // MÁSCARA VISUAL: Retorna el letterShift directo del objeto mandado por el Back
        valueFormatter: (params) => {
          if (params.data.isSubDepartmentHeader) return '';
          const shiftObj = params.data.dates?.[day.date]?.shift;
          return shiftObj?.letterShift || 'L'; 
        },

        cellStyle: (params) => {
          const baseStyle = { textAlign: 'center' };
          // Fila separadora de subdepartamento: celdas vacías sin contenido
          if (params.data.isSubDepartmentHeader) return { ...baseStyle };
          const dayData = params.data.dates?.[day.date];
          const shiftObj = dayData?.shift;
          const eventsList = dayData?.events || [];
          const currentShiftId = shiftObj?.id;

          // Si hay al menos un evento para colorear, pinta el borde
          const hasHighlightedEvent = eventsList.length > 0;

          if (hasHighlightedEvent) {
            baseStyle.boxShadow = 'inset 0 0 0 2px #ef4444';
          }

          if (shiftObj?.color) {
            if (currentShiftId === 'S-0') {              
              if (day.isToday && hasAdministrativeShift) return { ...baseStyle, backgroundColor: '#3b82f6' };
              if (day.isWeekend && hasAdministrativeShift) return { ...baseStyle, backgroundColor: '#f8d7da', color: '#81262e' };
            }
            return { ...baseStyle, backgroundColor: shiftObj.color };
          }    

          return baseStyle;
        },
        tooltipValueGetter: (params) => {
          const eventsList = params.data.dates?.[day.date]?.events || [];
          if (!eventsList || eventsList.length === 0) return null;

          const titleHtml = `<div class="tooltip-title">Eventos Destacados</div>`;
          const listHtml = eventsList
            .map((e, index) => `<div class="tooltip-item">${index + 1}. ${truncateText(e?.title ?? '', 25)}</div>`)
            .join('');

          return `<div class="custom-grid-tooltip">${titleHtml}${listHtml}</div>`;
        },
        flex: 1,          
        minWidth: 45,      
        resizable: true,
        sortable: false,
        suppressMovable: true,
        // Bloquea edición si es baja/vacaciones/permiso o fila separadora
        editable: (params) => {
          if (params.data.isSubDepartmentHeader) return false;
          return params.value !== 'S-1' && params.value !== 'S-2' && params.value !== 'S-3';
        },
        cellClassRules: {
          'cursor-not-allowed opacity-70 select-none text-white': (params) => params.value === 'S-1' || params.value === 'S-2' || params.value === 'S-3' ,
        },
        cellClass: '!font-bold',
        headerClass: () => {
          const classes = [];
          if (day.isToday) classes.push('header-today');
          if (day.isWeekend) classes.push('header-weekend');
          if (hasHighlightedEventsForDay) classes.push('header-has-events');
          return classes.join(' ');
        }
      };
    });

    return [...baseCols, ...dayCols];
  }, [fortnightDays, rowData]);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: false,
    resizable: true,
    sortingOrder: ['asc', 'desc'],
    tooltipComponent: CustomTooltip,
  }), []);

  const handleAutofillClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmAutofill = async () => {
    
    const start = scheduleData?.start;
    const end = scheduleData?.end;
    const departmentId = scheduleData?.departmentId;

    if (!start || !end || !departmentId || !isOneShift) return;

    try {
      setLoading(true);
      const shift = isOneShift ? cleanedShifts[0] : [];
      const id = scheduleData?.id;

      const newData = await autofillSchedule({ start, end, departmentId, shift, id, autofillFortnight: autofillAlways });
      if (onAutofillSuccess && newData) {
        onAutofillSuccess(newData);
      }
      setIsModalOpen(false);

    } catch (error) {
      console.error("Error al intentar rellenar la quincena:", error);
    } finally {
      setLoading(false);
    }
  };

  const isDataPending = shifts === undefined;
  const hasShiftGrid = !isDataPending && shifts?.length > 0;

  return (
    <div className="w-full flex flex-col gap-4 p-2 bg-[#535557] rounded-lg">
      
      <ScheduleTopBar
        viewMode={viewMode}
        disabledClasses={disabledClasses}
        exportToPDF={exportToPDF} 
        isExporting={isExporting} 
        setShowPastFortnight={setShowPastFortnight} 
        showPastFortnight={showPastFortnight} 
        setShowHistory={setShowHistory} 
        showHistory={showHistory} 
        onAutofillClick={handleAutofillClick} 
        onConfirmAutofill={handleConfirmAutofill} 
        isModalOpen={isModalOpen}
        isOneShift={isOneShift}
        setIsModalOpen ={setIsModalOpen}
        autofillAlways={autofillAlways}
        onAutofillAlwaysChange={onAutofillAlwaysChange}
        onLoadingHandleAutofill={onLoadingHandleAutofill}
      />

      <div id="merulink-grid-container" className="w-full flex flex-col gap-1">
        
          {hasShiftGrid ? ( 
            <>
              <div className="div-border w-full grid grid-cols-1 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)] gap-4 p-3 rounded-lg transition-all duration-300">
                <div className="min-w-0 flex justify-center md:justify-start">
                  <ShiftLegend shifts={shifts} activeBrush={brushShift} onSelectBrush={setBrushShift} viewMode={viewMode} />
                </div>
                <div className="min-w-0">
                  <div className='min-h-18'>
                    {liveAlerts?.length > 0 && (<LiveAlerts alerts={liveAlerts} title="Alertas Horario" /> )}
                  </div>
                </div>
              </div>

              {rowData.length === 0 ? (
                <SpanText text="Sin quincena registrada." dynamicClasses="mt-10 text-center text-[16px] mb-5" />
              ) : (
                <div className="relative w-full h-auto shadow-sm rounded-lg overflow-hidden">
                  {scheduleData?.isClosed && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none overflow-hidden select-none bg-[#2f3d4473]">
                      <div className="dark:text-gray-400/40 text-4xl md:text-6xl font-black uppercase tracking-[0.60em] transform -rotate-10 whitespace-nowrap">
                        Quincena cerrada
                      </div>
                    </div>
                  )}

                  <div className={`ag-theme-quartz w-full h-auto shadow-sm rounded-lg overflow-hidden ${brushShift ? 'cursor-brocha' : ''}`}>
                    <div className='w-full text-center mb-2'>
                      <h2 className='text-base font-bold text-gray-100'>{titleFortnight.charAt(0).toUpperCase() + titleFortnight.slice(1)} </h2> 
                    </div>
                    <AgGridReact
                      rowData={rowData}
                      columnDefs={columnDefs}
                      readOnlyEdit={viewMode} 
                      suppressCellFocus={viewMode}
                      rowClassRules={{
                        'subdept-header-row': (params) => params.data?.isSubDepartmentHeader,
                      }}
                      // Altura para fila separadora;
                      getRowHeight={(params) => (params.data?.isSubDepartmentHeader ? 30 : undefined)}
                      defaultColDef={defaultColDef}
                      animateRows={true}
                      theme={myTheme}
                      onCellClicked={handleCellClicked}
                      localeText={{ noRowsToShow: 'No hay registros para mostrar', loadingOoo: 'Cargando datos...' }}
                      onGridReady={onGridReady}
                      tooltipShowDelay={0}
                      domLayout="autoHeight"
                    />
                  </div>
                </div>
              )}
              
              {scheduleSaved && ( 
                <>
                  <div className="text-[0.875rem] text-gray-300 w-full flex justify-end mt-2">
                    Última Modificación: <span className="pl-2">{scheduleData?.lastModification ? scheduleData?.lastModification : '—'}</span>
                  </div>
                  <ScheduleWorkflowSteps viewMode={viewMode} reviewedBy={scheduleData?.reviewedBy} approvedBy={scheduleData?.approvedBy} /> 
                </>
              )}

              <div className="flex flex-col md:flex-row gap-3 w-full div-border">
                <ScheduleLegend />
                <div className="flex flex-col w-full md:flex-1"> 
                  <LabelFieldForm field="Observación" dynamicClasses="mb-2" />
                  <textarea
                    readOnly={mode === 'view'}
                    {...register('observations')}
                    rows="5"                 
                    cols="33"                 
                    placeholder="Escribe aquí una observación..."
                    className={`filter-input p-2 ${disabledClasses}`}
                  />
                  {errors?.observations && <ErrorMessage msg={errors.observations.message} />}  
                </div>  
              </div>
            </>
          ) : (
            <SpanText text="Sin turnos disponibles para este departamento" />
          )}
        
      </div>
      
      <PreviousFortnightViewer 
        isOpen={showPastFortnight} 
        onClose={() => setShowPastFortnight(false)} 
        preFortnightParams={preFortnightParams}
      />

      <HistoryViewer 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)}
        startDate={scheduleData?.start}
        endDate={scheduleData?.end}
        scheduleId={scheduleData?.id}
      />

    </div>
  );
});

export default ScheduleGrid;