import { useState, useEffect, useMemo, useRef } from 'react';
import { useEmployees } from '../../context/EmployeeContext'; 
import { useNavigate } from 'react-router-dom';
import { useListState } from '../../context/ListStateContext';
import useLoadMore from '../../hooks/useLoadMore';

import { normalizeText } from '../../utils/text-utils';
import { filterData } from '../../utils/filter-utils';

import EmployeeRow from './EmployeeRow';
import FilterByFields from '../Filters/FilterByFields';
import TitleHeader from '../Shared/TitleHeader';
import ButtonNavigate from '../Shared/ButtonNavigate';
import RowTableLoading from '../Shared/RowTableLoading';
import HasPermission from '../Shared/HasPermission';
import LoadMorePagination from '../Shared/LoadMorePagination';
import '../../Tables.css';

export default function EmployeeList() {
  const navigate = useNavigate();
  const { get, set } = useListState();
  const { loadingEmployeeData, employeeData, loadEmployees } = useEmployees();
   
  const itemsPerPage = 25;
  const LIST_KEY = 'employee-list';

  // Restaurar búsqueda/filtro recordados
  const restoredRef = useRef(null);
  if (restoredRef.current === null) {
    restoredRef.current = get(LIST_KEY);
  }
  const restored = restoredRef.current;

  const [searchValue, setSearchValue] = useState(restored?.searchValue ?? '');
  const [filterStatus, setFilterStatus] = useState(restored?.filterStatus ?? 'activo');

  // 'activo' es el filtro por defecto
  const isFiltering = Boolean(searchValue.trim()) || filterStatus !== 'all';

  // Persistir búsqueda/filtro (la posición de scroll la recuerda useLoadMore "remember")
  useEffect(() => {
    set(LIST_KEY, { ...(get(LIST_KEY) || {}), searchValue, filterStatus });
  }, [searchValue, filterStatus, get, set]);

  // Carga inicial (solo una vez; loadEmployees no es estable, no usarlo en deps)
  useEffect(() => {
    loadEmployees();
  }, []);

  const EMPLOYEE_SEARCH_FIELDS = [
      'numEmployee', 
      'firstName', 
      'lastName', 
      'ci', 
      'position', 
      'department', 
      'subDepartment'
  ];

  // Filtrar empleados
  const filteredEmployees = useMemo(() => {
      return filterData(
          employeeData,
          searchValue,
          EMPLOYEE_SEARCH_FIELDS,
          filterStatus,
          normalizeText
      );
  }, [employeeData, searchValue, filterStatus]);

  // "Ver más"/paginación scroll vertical con memoria de posición
  const {
    visibleItems, isExpanded, loadMore, showLess, activePage, totalPages, goToPage,
    chunkOf, chunkClass, total,
  } = useLoadMore(isFiltering ? filteredEmployees : employeeData, itemsPerPage, {
    remember: {
      storage: { get, set },
      key: LIST_KEY,
      isBaseView: !isFiltering,
      resetToken: `${searchValue}|${filterStatus}`,
    },
  });

return (
  <HasPermission permissions={['view-employees']} >
    <div className="main-data-cont table-container">    
      <div className="titles-table">
        <TitleHeader title='Listado de Empleados' />
        <HasPermission permissions={["create-employees"]}>
          <ButtonNavigate url={`/empleados/nuevo`} navigate={navigate} />
        </HasPermission>
      </div>

      <FilterByFields
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        filterStatus={filterStatus}
        onFilterStatus={setFilterStatus}
        showFilterStatus={true}
        moduleName='Empleado'
        placeholder='Ingrese nombre, apellido, cédula, departamento o sub-departamento'
      />

      <div className="rounded-lg shadow overflow-x-auto">
        <table className="min-w-full border-collapse text-sm sm:text-base">
          <thead>
            <tr className="tr-thead-table">
              <th className="px-4 py-3 text-left font-semibold">No. Empleado</th>
              <th className="px-4 py-3 text-left font-semibold">Cédula</th>
              <th className="px-4 py-3 text-left font-semibold">Nombre</th>
              <th className="px-4 py-3 text-left font-semibold">Apellido</th>
              <th className="px-4 py-3 text-left font-semibold">Departamento</th>
              <th className="px-4 py-3 text-left font-semibold">Cargo</th>
              <th className="px-4 py-3 text-left font-semibold">Estatus</th>
            </tr>
          </thead>
          <tbody>
            {loadingEmployeeData ? (
              <RowTableLoading colSpan={8} />
            ) : (
              visibleItems.map((emp, index) => (
                <EmployeeRow
                  key={emp.id}
                  emp={emp}
                  rowClassName={chunkClass(index)}
                  chunk={chunkOf(index)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <LoadMorePagination
        activePage={activePage}
        totalPages={totalPages}
        goToPage={goToPage}
        isExpanded={isExpanded}
        loadMore={loadMore}
        showLess={showLess}
        itemsPerPage={itemsPerPage}
        visibleCount={visibleItems.length}
        total={total}
        moduleName={'Empleado'}
      />
    </div>
  </HasPermission>
);
}
