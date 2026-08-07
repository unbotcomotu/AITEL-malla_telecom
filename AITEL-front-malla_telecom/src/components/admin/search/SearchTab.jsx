import React, { useState, useEffect } from 'react';
import { SearchApi } from '../../../services/admin/search/searchApi';

const SearchTab = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({ types: [], status: [], cycles: [], categories: [] });
  const [sortBy, setSortBy] = useState('relevance');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [availableFilters, setAvailableFilters] = useState({ types: [], status: [], cycles: [], categories: [] });

  useEffect(() => {
    const loadFilters = async () => {
      try {
        setLoading(true);
        const filters = await SearchApi.getSearchFilters();
        setAvailableFilters(filters);
      } catch (error) {
        setError('Error al cargar filtros de búsqueda');
      } finally {
        setLoading(false);
      }
    };
    loadFilters();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim() || Object.values(selectedFilters).some(arr => arr.length > 0)) {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedFilters, sortBy]);

  const performSearch = async () => {
    try {
      setLoading(true);
      const results = await SearchApi.searchAll(searchTerm, {
        types: selectedFilters.types.join(','),
        status: selectedFilters.status.join(','),
        cycles: selectedFilters.cycles.join(','),
        categories: selectedFilters.categories.join(','),
        sortBy
      });
      setSearchResults(results);
    } catch (error) {
      setError('Error al realizar la búsqueda');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getGroupedResults = () => searchResults.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {});

  const toggleFilter = (filterType, value) => {
    setSelectedFilters(prev => {
      const currentFilters = prev[filterType];
      const newFilters = currentFilters.includes(value) ? currentFilters.filter(f => f !== value) : [...currentFilters, value];
      return { ...prev, [filterType]: newFilters };
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({ types: [], status: [], cycles: [], categories: [] });
    setSearchTerm('');
  };

  const getActiveFiltersCount = () => Object.values(selectedFilters).reduce((sum, filters) => sum + filters.length, 0);

  const groupedResults = getGroupedResults();

  return (
    <div className="p-8 text-ink">
      <div className="mb-8 text-center">
        <h2 className="m-0 mb-2 font-display text-2xl font-bold text-accent">🔍 Buscador Avanzado</h2>
        <p className="m-0 text-base text-muted">Encuentra rápidamente categorías, subcategorías, cursos y profesores</p>
      </div>

      <div className="relative mb-6">
        <input
          disabled={loading}
          type="text"
          placeholder="🔍 Buscar por nombre, código, descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-2xl border border-line bg-surface py-5 pl-6 pr-32 text-lg font-medium text-ink outline-none focus:border-accent disabled:opacity-60"
        />
        <div className="absolute right-4 top-1/2 flex -translate-y-1/2 gap-2">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            disabled={loading}
            className={`relative rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60 ${showAdvancedFilters ? 'bg-accent text-ink-on-accent' : 'bg-line/40 text-muted'}`}
          >
            🎛️ Filtros
            {getActiveFiltersCount() > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-bad text-[11px] font-semibold text-white">
                {getActiveFiltersCount()}
              </span>
            )}
          </button>
        </div>
      </div>

      {showAdvancedFilters && (
        <div className="mb-6 rounded-2xl border border-accent/20 bg-accent/5 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="m-0 text-lg text-accent">🎛️ Filtros Avanzados</h3>
            <div className="flex items-center gap-3">
              <select
                disabled={loading}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink outline-none disabled:opacity-60"
              >
                <option value="relevance">Ordenar por Relevancia</option>
                <option value="name">Ordenar por Nombre</option>
                <option value="cycle">Ordenar por Ciclo</option>
                <option value="credits">Ordenar por Créditos</option>
              </select>
              <button onClick={clearAllFilters} disabled={loading} className="rounded-lg bg-bad/20 px-4 py-2 text-sm font-medium text-bad disabled:opacity-60">🗑️ Limpiar</button>
            </div>
          </div>

          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            <FilterGroup title="Tipo de contenido">
              {availableFilters.types.map(type => (
                <FilterChip
                  key={type.id}
                  active={selectedFilters.types.includes(type.id)}
                  activeColor={type.color}
                  onClick={() => toggleFilter('types', type.id)}
                  disabled={loading}
                >
                  <span>{type.icon}</span> {type.name}
                </FilterChip>
              ))}
            </FilterGroup>

            <FilterGroup title="Estado (solo cursos)">
              {availableFilters.status.map(status => (
                <FilterChip key={status.id} active={selectedFilters.status.includes(status.id)} activeColor={status.color} onClick={() => toggleFilter('status', status.id)} disabled={loading}>
                  {status.name}
                </FilterChip>
              ))}
            </FilterGroup>

            <FilterGroup title="Categoría">
              {availableFilters.categories.map(category => (
                <FilterChip key={category.id} active={selectedFilters.categories.includes(category.id)} activeColor={category.color} onClick={() => toggleFilter('categories', category.id)} disabled={loading}>
                  {category.name}
                </FilterChip>
              ))}
            </FilterGroup>

            <FilterGroup title="Ciclo académico">
              {availableFilters.cycles.map(cycle => (
                <FilterChip key={cycle.id} small active={selectedFilters.cycles.includes(cycle.id)} activeColor="var(--t-accent)" onClick={() => toggleFilter('cycles', cycle.id)} disabled={loading}>
                  {cycle.id}
                </FilterChip>
              ))}
            </FilterGroup>
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface px-5 py-4">
        <div>
          {searchResults.length > 0 || searchTerm.trim() || getActiveFiltersCount() > 0 ? (
            <span className="text-base font-semibold text-ink">
              {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
            </span>
          ) : (
            <span className="text-base text-muted">Escribe algo para buscar</span>
          )}
          {searchTerm && <span className="ml-3 text-sm text-muted">para "{searchTerm}"</span>}
        </div>

        {Object.keys(groupedResults).length > 0 && (
          <div className="flex gap-4 text-sm">
            {Object.entries(groupedResults).map(([type, items]) => {
              const typeInfo = availableFilters.types.find(t => t.id === type);
              return (
                <div key={type} className="flex items-center gap-1.5">
                  <span>{typeInfo?.icon}</span>
                  <span style={{ color: typeInfo?.color }}>{items.length}</span>
                  <span className="text-muted">{typeInfo?.name}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        {searchResults.length === 0 ? (
          <div className="p-16 text-center text-muted">
            <div className="mb-4 text-5xl">🔍</div>
            <h3 className="mb-2 text-xl text-ink">No se encontraron resultados</h3>
            <p className="text-base">{searchTerm || getActiveFiltersCount() > 0 ? 'Intenta ajustar tu búsqueda o filtros' : 'Comienza escribiendo en el buscador o usa los filtros'}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {Object.entries(groupedResults).map(([type, items]) => {
              const typeInfo = availableFilters.types.find(t => t.id === type);
              return <ResultSection key={type} type={type} typeInfo={typeInfo} items={items} searchTerm={searchTerm} />;
            })}
          </div>
        )}
      </div>

      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-accent/30 bg-surface p-6 text-ink">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent/30 border-t-accent" />
            <span className="text-base font-semibold">Buscando...</span>
          </div>
        </div>
      )}
    </div>
  );
};

const FilterGroup = ({ title, children }) => (
  <div>
    <h4 className="mb-3 text-sm text-muted">{title}</h4>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);

const FilterChip = ({ active, activeColor, onClick, disabled, small, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{ background: active ? activeColor : undefined }}
    className={`flex items-center gap-1 rounded-full font-medium disabled:cursor-not-allowed disabled:opacity-60 ${
      small ? 'min-w-[32px] px-2 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
    } ${active ? 'text-white' : 'bg-line/30 text-muted'}`}
  >
    {children}
  </button>
);

const ResultSection = ({ type, typeInfo, items, searchTerm }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const color = typeInfo?.color || 'var(--t-accent)';

  return (
    <div className="overflow-hidden rounded-2xl border bg-surface" style={{ borderColor: `${color}40` }}>
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex cursor-pointer items-center justify-between p-5"
        style={{ borderBottom: isExpanded ? '1px solid var(--t-line)' : 'none' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{typeInfo?.icon}</span>
          <h3 className="m-0 text-xl font-bold" style={{ color }}>{typeInfo?.name}</h3>
          <span className="rounded-full px-2 py-1 text-xs font-semibold" style={{ background: `${color}20`, color }}>{items.length}</span>
        </div>
        <div className="text-lg transition-transform" style={{ color, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</div>
      </div>

      {isExpanded && (
        <div className="p-5">
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
            {items.map(item => <ResultCard key={`${type}-${item.id}`} item={item} type={type} typeInfo={typeInfo} searchTerm={searchTerm} />)}
          </div>
        </div>
      )}
    </div>
  );
};

const highlightText = (text, highlight) => {
  if (!highlight || !text) return text;
  const regex = new RegExp(`(${highlight})`, 'gi');
  return text.split(regex).map((part, index) =>
    index % 2 === 1 ? (
      <span key={index} className="rounded bg-warn px-1 font-semibold text-ink">{part}</span>
    ) : part
  );
};

const ResultCard = ({ item, type, typeInfo, searchTerm }) => {
  const color = typeInfo?.color || 'var(--t-accent)';

  const handleCardClick = () => {
    switch (type) {
      case 'category': console.log('Abrir gestión de categoría:', item.id); break;
      case 'subcategory': console.log('Abrir gestión de subcategoría:', item.id); break;
      case 'course': console.log('Abrir gestión de curso:', item.id); break;
      case 'professor': console.log('Ver perfil del profesor:', item.id); break;
      default: break;
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="relative cursor-pointer overflow-hidden rounded-xl border bg-bg p-5 transition-all hover:-translate-y-1"
      style={{ borderColor: `${color}40` }}
    >
      <div className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${color}, ${color}80)` }} />

      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <h4 className="m-0 mb-1 text-lg font-bold text-ink">
            {item.code && <span style={{ color }} className="mr-2">{highlightText(item.code, searchTerm)}</span>}
            {highlightText(item.name, searchTerm)}
          </h4>
          {(item.categoryName || item.subcategoryName) && (
            <div className="mb-2 flex items-center gap-1.5 text-xs text-muted">
              {item.categoryName && <><span>{item.categoryName}</span>{item.subcategoryName && <span>→</span>}</>}
              {item.subcategoryName && <span>{item.subcategoryName}</span>}
            </div>
          )}
        </div>
        <span className="rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wide" style={{ background: `${color}20`, color }}>
          {typeInfo?.name?.slice(0, -1)}
        </span>
      </div>

      {item.description && <p className="m-0 mb-4 text-sm leading-snug text-muted">{highlightText(item.description, searchTerm)}</p>}

      <div className="flex flex-wrap items-center gap-3 text-[13px]">
        {type === 'category' && (
          <>
            <StatItem icon="📁" value={item.subcategoriesCount} label="subcategorías" color={color} />
            <StatItem icon="📚" value={item.coursesCount} label="cursos" color={color} />
          </>
        )}
        {type === 'subcategory' && (
          <>
            <StatItem icon="🎯" value={item.requiredCourses} label={`requerido${item.requiredCourses !== 1 ? 's' : ''}`} color="var(--t-good)" />
            <StatItem icon="📚" value={item.coursesCount} label="cursos" color={color} />
            {item.cycle && <CycleBadge cycle={item.cycle} color={color} />}
          </>
        )}
        {type === 'course' && (
          <>
            <StatItem icon="⭐" value={item.credits} label="créditos" color={color} />
            <StatItem icon="⏰" value={`${item.totalHours}h`} label="semanales" color={color} />
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${item.isActive ? 'bg-good/20 text-good' : 'bg-bad/20 text-bad'}`}>
              {item.isActive ? '✅ Activo' : '❌ Inactivo'}
            </span>
            {item.cycle && <CycleBadge cycle={item.cycle} color={color} />}
          </>
        )}
        {type === 'professor' && (
          <>
            <StatItem icon="📚" value={item.totalCourses} label={`curso${item.totalCourses !== 1 ? 's' : ''}`} color={color} />
            <StatItem icon="📅" value={item.activeCycles.length} label={`ciclo${item.activeCycles.length !== 1 ? 's' : ''} activo${item.activeCycles.length !== 1 ? 's' : ''}`} color={color} />
          </>
        )}
      </div>

      {item.scheduledCycles?.length > 0 && (
        <div className="mt-3 rounded-lg bg-surface p-2.5 text-xs">
          <span className="text-muted">📅 Ciclos programados: </span>
          <span className="text-ink">{item.scheduledCycles.join(', ')}</span>
        </div>
      )}

      {item.courses?.length > 0 && (
        <div className="mt-3 rounded-lg bg-surface p-2.5 text-xs">
          <span className="text-muted">📚 Cursos: </span>
          <span className="text-ink">{item.courses.join(', ')}</span>
        </div>
      )}

      <div className="absolute bottom-3 right-3 text-base opacity-60" style={{ color }}>→</div>
    </div>
  );
};

const StatItem = ({ icon, value, label, color }) => (
  <div className="flex items-center gap-1">
    <span className="text-muted">{icon}</span>
    <span className="font-semibold" style={{ color }}>{value}</span>
    <span className="text-muted">{label}</span>
  </div>
);

const CycleBadge = ({ cycle, color }) => (
  <div className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: `${color}20`, color }}>Ciclo {cycle}</div>
);

export default SearchTab;
