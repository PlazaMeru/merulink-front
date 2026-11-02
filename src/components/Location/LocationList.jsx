import { useEffect, useMemo, useState } from 'react';
import { useLocations } from '../../context/LocationContext';
import { useListState } from '../../context/ListStateContext';
import useLoadMore from '../../hooks/useLoadMore';
import { filterData } from '../../utils/filter-utils';
import { normalizeText } from '../../utils/text-utils';
import FilterByFields from '../Filters/FilterByFields';
import LoadMorePagination from '../Shared/LoadMorePagination';
import RowTableLoading from '../Shared/RowTableLoading';
import TitleHeader from '../Shared/TitleHeader';

export default function LocationList() {
  const { get, set } = useListState();
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
    () => filterData(locationData, searchValue, ['key', 'label'], '', normalizeText),
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
      </div>

      <FilterByFields
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        moduleName="Ubicaciones"
        placeholder="Ingrese la clave o nombre de la ubicación"
      />

      <div className="rounded-lg shadow">
        <table className="min-w-full border-collapse text-sm sm:text-base">
          <thead>
            <tr className="tr-thead-table">
              <th className="px-4 py-3 text-left font-semibold">Clave</th>
              <th className="px-4 py-3 text-left font-semibold">Ubicación</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <RowTableLoading colSpan={2} />
            ) : visibleItems.length > 0 ? (
              visibleItems.map((location, index) => (
                <tr
                  key={location.id}
                  data-chunk={chunkOf(index)}
                  className={`border-b tr-table ${chunkClass(index)}`}
                >
                  <td className="px-4 py-3 text-white-800 font-medium">{location.key}</td>
                  <td className="px-4 py-3 text-white-700">{location.label}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-center text-gray-400">
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