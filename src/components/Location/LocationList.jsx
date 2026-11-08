import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocations } from '../../context/LocationContext';
import { useListState } from '../../context/ListStateContext';
import useLoadMore from '../../hooks/useLoadMore';
import { filterData } from '../../utils/filter-utils';
import { normalizeText } from '../../utils/text-utils';
import FilterByFields from '../Filters/FilterByFields';
import LoadMorePagination from '../Shared/LoadMorePagination';
import RowTableLoading from '../Shared/RowTableLoading';
import TitleHeader from '../Shared/TitleHeader';
import ButtonNavigate from '../Shared/ButtonNavigate';
import LocationRow from './LocationRow';

export default function LocationList() {
  const { get, set } = useListState();
  const navigate = useNavigate();
  const { loading, locationData, loadLocations } = useLocations();
  const itemsPerPage = 25;
  const listKey = 'location-list';

  const [searchValue, setSearchValue] = useState(() => get(listKey)?.searchValue ?? '');
  const isFiltering = Boolean(searchValue.trim());

  useEffect(() => {
    set(listKey, { ...(get(listKey) || {}), searchValue });
  }, [searchValue, get, set]);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  const filteredLocations = useMemo(
    () => filterData(locationData, searchValue, ['key', 'area', 'floor', 'referencePoint'], '', normalizeText),
    [locationData, searchValue]
  );

  const {
    visibleItems,
    isExpanded,
    loadMore,
    showLess,
    activePage,
    totalPages,
    goToPage,
    chunkOf,
    chunkClass,
    total,
  } = useLoadMore(isFiltering ? filteredLocations : locationData, itemsPerPage, {
    remember: {
      storage: { get, set },
      key: listKey,
      isBaseView: !isFiltering,
      resetToken: `${searchValue}|`,
    },
  });

  return (
    <div className="main-data-cont table-container">
      <div className="titles-table">
        <TitleHeader title="Listado de Ubicaciones" />
        <ButtonNavigate url={`/eventos/ubicaciones/nuevo`} navigate={navigate}  />
      </div>

      <FilterByFields
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        moduleName="Ubicaciones"
        placeholder="Ingrese Zona / Área de la ubicación"
      />

      <div className="rounded-lg shadow">
        <table className="min-w-full border-collapse text-sm sm:text-base">
          <thead>
            <tr className="tr-thead-table">
              <th className="px-4 py-3 text-left font-semibold">Zona / Área</th>
              <th className="px-4 py-3 text-left font-semibold">Nivel / Planta</th>
              <th className="px-4 py-3 text-left font-semibold">Punto de Referencia</th>
              <th className="px-4 py-3 text-left font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <RowTableLoading colSpan={4} />
            ) : visibleItems.length > 0 ? (
              visibleItems.map((location, index) => (
                <LocationRow
                  key={location.id}
                  location={location}
                  chunk={chunkOf(index)}
                  rowClassName={chunkClass(index)}
                />
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                  No se encontraron ubicaciones.
                </td>
              </tr>
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
        moduleName="Ubicaciones"
      />
    </div>
  );
}