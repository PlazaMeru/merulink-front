import { X } from 'lucide-react';
import { lockerCategories } from '../../utils/StaticData/locker-room-utils.js';

export default function FilterByFields({ 
  searchValue, 
  searchDateValue, 
  onSearchChange, 
  filterStatus, 
  onFilterStatus, 
  onFilterDate,
  onFilterCategory, 
  showFilterStatus = false, 
  showFilterDate = false, 
  showFilterCategory = false,
  moduleName = '', 
  placeholder = '',
  active = 'activo',
  inactive = 'inactivo'}) {

  return (
    <div className="mb-6 p-4 rounded-lg search-container shadow-sm">
      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Label y Input de búsqueda */}
        <div className="flex flex-none items-center gap-3">
          <label className="whitespace-nowrap text-sm font-bold">
            Buscar {moduleName}:
          </label>
          <div className="relative w-64">
            <input
              type="text"
              autoFocus
              placeholder={placeholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-4 py-2 pr-9 rounded-lg filter-input focus:outline-none transition-all placeholder:text-gray-500 placeholder:italic text-sm"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                title="Limpiar búsqueda"
                className="skip-style-btn absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-none items-center gap-4 flex-wrap">
          {showFilterDate && (
            <input 
              onChange={(e) => onFilterDate(e.target.value)} 
              value={searchDateValue}
              type='date' 
              className="px-3 py-1.5 rounded-lg filter-input text-sm outline-none" 
            />
          )}

          {showFilterCategory && (
            <div className="flex items-center gap-2">
              <span className='text-sm font-bold'>Categoría:</span>
              <select 
                onChange={(e) => onFilterCategory(e.target.value)}
                className="text-sm w-auto px-2 py-1.5 rounded-md filter-input text-gray-300 cursor-pointer outline-none"
              >
                <option className='bg-[#3c4042]' value="">Todos</option>
                {lockerCategories.map((item) => (
                  <option key={`category-${item.id}`} className='bg-[#3c4042]' value={item.key}>
                    {item.value}
                  </option>
                ))}
              </select>
            </div>
          )}
          {/* Filtros por Estado */}
          {showFilterStatus && (
            <div className="flex gap-2">
              <button
                onClick={() => onFilterStatus(active)}
                className={`skip-style-btn status-btn text-xs px-3 py-1.5 ${filterStatus === active ? 'status-btn--active' : 'status-btn--neutral'}`}
              >
                <span className="capitalize">{active}s</span>
              </button>
              <button
                onClick={() => onFilterStatus(inactive)}
                className={`skip-style-btn status-btn text-xs px-3 py-1.5 ${filterStatus === inactive ? 'status-btn--inactive' : 'status-btn--neutral'}`}
              >
                <span className="capitalize">{inactive}s</span>
              </button>
              <button
                onClick={() => onFilterStatus('all')}
                className={`skip-style-btn status-btn text-xs px-3 py-1.5 ${filterStatus === 'all' ? 'status-btn--all' : 'status-btn--neutral'}`}
              >
                Todos
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
