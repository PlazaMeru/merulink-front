import React, { useState, useEffect, useMemo  } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { themeQuartz } from 'ag-grid-community';
import { Rnd } from 'react-rnd';
import dayjs from 'dayjs';

import { useSchedules } from '../../../context/ScheduleContext';

import { getFortnightDays } from '../../../utils/Schedule/schedule-utils';
import { truncateText } from '../../../utils/text-utils';

import LiveAlerts from '../../Shared/LiveAlerts';
import SpanText from '../../Shared/SpanText';
import DragBar from '../../Shared/DragBar';
import BottomWarning from '../../Shared/BottomWarning';

const PreviousFortnightViewer = ({ isOpen, onClose, preFortnightParams  }) => {
  
  const [loadingPrevious, setLoadingPrevious] = useState(false);
  const [previousData, setPreviousData] = useState({});
  const { loadFormData } = useSchedules();
  // const { runLiveValidation } = useScheduleValidation();
  const [previousFortnightDays, setPreviousFortnightDays] = useState([]);
  // const [liveAlerts, setLiveAlerts] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const shifts = previousData?.shifts;
  const hasAdministrativeShift = useMemo(() => shifts?.some(s => s.typeShift === 'administrative'), [shifts]);
  
  // Guarda el tamaño y las coordenadas exactas del visor
  const [dimensions, setDimensions] = useState({
    width: 500,
    height: 300,
    x: 600,
    y: 40
  });
  
  const viewMode = true;
  const startDate = preFortnightParams.start;
  const endDate = preFortnightParams.end;
  const groupedEmployees = previousData?.employees;
  
  const CustomTooltip = (params) => {
    if (!params.value) return null;
    return (
      <div 
        className="custom-grid-tooltip-container"
        dangerouslySetInnerHTML={{ __html: params.value }}
      />
    );
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
  };

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

  // useEffect(() => {
  //   if (rowData.length > 0) {
  //     const alerts = runLiveValidation(rowData);
  //     setLiveAlerts(alerts);
  //   }
  // }, [rowData, runLiveValidation]);
  
  const columnDefs = useMemo(() => {
    const baseCols = [
      { 
        headerName: 'Empleado', 
        field: 'fullName', 
        pinned: 'left', 
        width: 120,
        cellClass: (params) => params.data?.isSubDepartmentHeader ? 'subdept-header-name' : 'text-xs font-semibold',
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

    const dayCols = previousFortnightDays.map((day) => {

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

        valueGetter: (params) => {
          if (params.data.isSubDepartmentHeader) return null;
          return params.data.dates?.[day.date]?.shift?.id ?? 'S-0';
        },

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
        minWidth: 40,      
        resizable: true,
        sortable: false,
        suppressMovable: true,
        // Bloquea edición si es baja/vacaciones/permiso o fila separadora
        editable: (params) => {
          if (params.data.isSubDepartmentHeader) return false;
          return params.value !== 'S-1' && params.value !== 'S-2' && params.value !== 'S-3';
        },
        cellClassRules: {
          'cursor-not-allowed opacity-60 select-none text-gray-400 bg-gray-100': (params) => params.value === 'S-1' || params.value === 'S-2' || params.value === 'S-3' ,
        },
        cellClass: '!font-bold',
        headerClass: () => {
          const classes = [];
          if (day.isToday && hasAdministrativeShift) classes.push('header-today');
          if (day.isWeekend && hasAdministrativeShift) classes.push('header-weekend');
          if (hasHighlightedEventsForDay) classes.push('header-has-events');
          return classes.join(' ');
        }
      };
    });

    return [...baseCols, ...dayCols];
  }, [previousFortnightDays, rowData]);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: false,
    resizable: true,
    sortingOrder: ['asc', 'desc'],
    tooltipComponent: CustomTooltip,
  }), []);

  useEffect(() => {
    const loadPreFortninght = async () => {
      if (!isOpen) return;
      
      // Centrar automáticamente la primera vez que se abre en la pantalla del usuario
      const windowWidth = window.innerWidth;
      const calculatedWidth = windowWidth < 640 ? windowWidth - -100 : 700; // Ajusta ancho inicial
      const calculatedHeight = 450; 

      setDimensions({
        width: calculatedWidth,
        height: calculatedHeight,
        x: (windowWidth / 2) - (calculatedWidth / 2),
        y: 60
      });
      
      const departmentId = preFortnightParams.departmentId;

      if (departmentId && startDate && endDate) {
        setLoadingPrevious(true);
        try {
          const date = dayjs(startDate);
          const year = date.year();
          const month = date.month() + 1;

          const dayOfMonth = date.date();
          const fortnightNumber = dayOfMonth <= 15 ? 1 : 2;
          
          const days = getFortnightDays(year, Number(month), fortnightNumber);
          const previousSchedule = await loadFormData(departmentId, startDate, endDate);

          setPreviousFortnightDays(days);
          setPreviousData(previousSchedule);
        } catch (error) {
          console.error("Error cargando quincena anterior", error);
        } finally {
          setLoadingPrevious(false);
        }
      }
    };
  
    loadPreFortninght();   
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Rnd
      size={{ width: dimensions.width, height: dimensions.height }}
      position={{ x: dimensions.x, y: dimensions.y }}
      onDragStop={(e, d) => {
        setDimensions(prev => ({ ...prev, x: d.x, y: d.y }));
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        setDimensions({
          width: parseInt(ref.style.width, 10),
          height: parseInt(ref.style.height, 10),
          ...position
        });
      }}
      minWidth={400}
      minHeight={250}
      // bounds="window" 
      
      // Esto le dice a react-rnd que ignore el arrastre si tocan algo con la clase 'no-drag'
      cancel=".no-drag"
      className="fixed z-50 bg-[#3a3c3e] border border-gray-600 rounded-lg shadow-2xl overflow-hidden text-gray-200 flex flex-col"
      style={{ position: 'fixed', display: 'flex', flexDirection: 'column' }}
    >

      <DragBar onClose={onClose} text="Quincena Anterior" />

      {/* Contenido de la Tabla */}
      <div className="flex-1 min-h-0 p-3 overflow-auto text-xs">
        {loadingPrevious ? (
          <SpanText text="Cargando Quincena Anterior..." centerElement={true} />
        ) : (
          
          <div className="w-full flex flex-col gap-4">
            <div className='w-full text-center'>
              <h2 className='text-base font-bold text-gray-100'> 
                {`Quincena ${dayjs(startDate).format('DD/MM/YYYY')} al ${dayjs(endDate).format('DD/MM/YYYY')} `} 
              </h2>
            </div>

            {rowData.length === 0 ? (
              <SpanText text="Sin quincena anterior registrada." centerElement={true} />
            ) : (
              <>
                {/* Layout de Leyenda + Alertas */}
                {/* <div className="div-border w-full grid grid-cols-1 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)] gap-4 p-3 rounded-lg transition-all duration-300">
                  <div className="min-w-0">
                    <ShiftLegend shifts={previousData?.shifts} viewMode={true} dynamicClasses='pl-2 py-2' />
                  </div>
                  <div className="min-w-0">
                    {liveAlerts?.length > 0 && (<LiveAlerts alerts={liveAlerts} /> )}
                  </div>
                </div> */}

                <div className="ag-theme-quartz w-full h-auto shadow-sm rounded-lg overflow-hidden shrink-0">
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
                    localeText={{ noRowsToShow: 'No hay registros para mostrar', loadingOoo: 'Cargando datos...' }}
                    onGridReady={onGridReady}
                    tooltipShowDelay={0}
                    domLayout="autoHeight"
                  />
                </div>
              </>
            )}
          </div> 
        )}
      </div>   

      <BottomWarning />
      
    </Rnd>
  );
};

export default PreviousFortnightViewer;