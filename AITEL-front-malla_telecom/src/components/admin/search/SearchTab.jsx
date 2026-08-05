import React, { useState, useMemo, useEffect } from 'react';
import { SearchApi } from '../../../services/admin/search/searchApi';
const SearchTab = () => {
  // Datos mock completos para búsqueda
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    types: [], // category, subcategory, course, professor
    status: [], // active, inactive
    cycles: [], // 1-10
    categories: [] // Obligatorio, Electivo
  });
  const [sortBy, setSortBy] = useState('relevance'); // relevance, name, cycle, credits
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filtros disponibles
  const [availableFilters, setAvailableFilters] = useState({
    types: [],
    status: [],
    cycles: [],
    categories: []
  });

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

    // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim() || Object.values(selectedFilters).some(arr => arr.length > 0)) {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 300); // 300ms debounce

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

  const getGroupedResults = () => {
    return searchResults.reduce((acc, item) => {
      if (!acc[item.type]) acc[item.type] = [];
      acc[item.type].push(item);
      return acc;
    }, {});
  };

  const toggleFilter = (filterType, value) => {
    setSelectedFilters(prev => {
      const currentFilters = prev[filterType];
      const newFilters = currentFilters.includes(value)
        ? currentFilters.filter(f => f !== value)
        : [...currentFilters, value];
      
      return { ...prev, [filterType]: newFilters };
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      types: [],
      status: [],
      cycles: [],
      categories: []
    });
    setSearchTerm('');
  };

  const getActiveFiltersCount = () => {
    return Object.values(selectedFilters).reduce((sum, filters) => sum + filters.length, 0);
  };

  const groupedResults=getGroupedResults();

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '32px'
      }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          background: 'linear-gradient(to right, #06b6d4, #3b82f6, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: 0,
          marginBottom: '8px'
        }}>
          🔍 Buscador Avanzado
        </h2>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '16px' }}>
          Encuentra rápidamente categorías, subcategorías, cursos y profesores
        </p>
      </div>

      {/* Search Bar */}
      <div style={{
        position: 'relative',
        marginBottom: '24px'
      }}>
        <input
          disabled={loading}
          type="text"
          placeholder="🔍 Buscar por nombre, código, descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '20px 24px',
            paddingRight: '120px',
            borderRadius: '16px',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
            color: 'white',
            fontSize: '18px',
            fontWeight: '500',
            backdropFilter: 'blur(10px)',
            outline: 'none',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            opacity: loading ? 0.6 : 1,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#06b6d4';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(6, 182, 212, 0.2)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
          }}
        />
        
        <div style={{
          position: 'absolute',
          right: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          gap: '8px'
        }}>
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            disabled={loading}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: showAdvancedFilters ? '#06b6d4' : 'rgba(148, 163, 184, 0.2)',
              color: showAdvancedFilters ? 'white' : '#94a3b8',
              fontSize: '14px',
              fontWeight: '500',
              position: 'relative',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            🎛️ Filtros
            {getActiveFiltersCount() > 0 && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                background: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600'
              }}>
                {getActiveFiltersCount()}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(6, 182, 212, 0.2)',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{
              color: '#67e8f9',
              fontSize: '18px',
              margin: 0
            }}>
              🎛️ Filtros Avanzados
            </h3>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <select
                disabled={loading}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <option value="relevance">Ordenar por Relevancia</option>
                <option value="name">Ordenar por Nombre</option>
                <option value="cycle">Ordenar por Ciclo</option>
                <option value="credits">Ordenar por Créditos</option>
              </select>
              
              <button
                onClick={clearAllFilters}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                🗑️ Limpiar
              </button>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            {/* Type Filters */}
            <div>
              <h4 style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '12px' }}>
                Tipo de contenido
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {availableFilters.types.map(type => (
                  <button
                    key={type.id}
                    onClick={() => toggleFilter('types', type.id)}
                    disabled={loading}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      border: 'none',
                      background: selectedFilters.types.includes(type.id) 
                        ? type.color 
                        : 'rgba(148, 163, 184, 0.2)',
                      color: selectedFilters.types.includes(type.id) ? 'white' : '#94a3b8',
                      fontSize: '12px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      opacity: loading ? 0.6 : 1,
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <span>{type.icon}</span>
                    {type.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filters */}
            <div>
              <h4 style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '12px' }}>
                Estado (solo cursos)
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {availableFilters.status.map(status => (
                  <button
                    key={status.id}
                    onClick={() => toggleFilter('status', status.id)}
                    disabled={loading}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      border: 'none',
                      background: selectedFilters.status.includes(status.id) 
                        ? status.color 
                        : 'rgba(148, 163, 184, 0.2)',
                      color: selectedFilters.status.includes(status.id) ? 'white' : '#94a3b8',
                      fontSize: '12px',
                      fontWeight: '500',
                      opacity: loading ? 0.6 : 1,
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {status.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filters */}
            <div>
              <h4 style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '12px' }}>
                Categoría
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {availableFilters.categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => toggleFilter('categories', category.id)}
                    disabled={loading}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      border: 'none',
                      background: selectedFilters.categories.includes(category.id) 
                        ? category.color 
                        : 'rgba(148, 163, 184, 0.2)',
                      color: selectedFilters.categories.includes(category.id) ? 'white' : '#94a3b8',
                      fontSize: '12px',
                      fontWeight: '500',
                      opacity: loading ? 0.6 : 1,
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Cycle Filters */}
            <div>
              <h4 style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '12px' }}>
                Ciclo académico
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {availableFilters.cycles.map(cycle => (
                  <button
                    key={cycle.id}
                    onClick={() => toggleFilter('cycles', cycle.id)}
                    disabled={loading}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '16px',
                      border: 'none',
                      background: selectedFilters.cycles.includes(cycle.id) 
                        ? '#3b82f6' 
                        : 'rgba(148, 163, 184, 0.2)',
                      color: selectedFilters.cycles.includes(cycle.id) ? 'white' : '#94a3b8',
                      fontSize: '11px',
                      fontWeight: '500',
                      minWidth: '32px',
                      opacity: loading ? 0.6 : 1,
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {cycle.id}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        padding: '16px 20px',
        background: 'rgba(30, 41, 59, 0.6)',
        borderRadius: '12px',
        border: '1px solid rgba(148, 163, 184, 0.2)'
      }}>
        <div>
          <span style={{ color: '#cbd5e1', fontSize: '16px', fontWeight: '600' }}>
            {searchResults.length > 0 || searchTerm.trim() || getActiveFiltersCount() > 0 ? (
              <span style={{ color: '#cbd5e1', fontSize: '16px', fontWeight: '600' }}>
                {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
              </span>
            ) : (
              <span style={{ color: '#94a3b8', fontSize: '16px' }}>
                Escribe algo para buscar
              </span>
            )}          
          </span>
          {searchTerm && (
            <span style={{ color: '#94a3b8', fontSize: '14px', marginLeft: '12px' }}>
              para "{searchTerm}"
            </span>
          )}
        </div>
        
        {Object.keys(groupedResults).length > 0 && (
          <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
            {Object.entries(groupedResults).map(([type, items]) => {
              const typeInfo = availableFilters.types.find(t => t.id === type);
              return (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{typeInfo?.icon}</span>
                  <span style={{ color: typeInfo?.color }}>{items.length}</span>
                  <span style={{ color: '#94a3b8' }}>{typeInfo?.name}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Search Results */}
      <div>
        {searchResults.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '64px 24px',
            color: '#94a3b8'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>
              No se encontraron resultados
            </h3>
            <p style={{ fontSize: '16px' }}>
              {searchTerm || getActiveFiltersCount() > 0 
                ? 'Intenta ajustar tu búsqueda o filtros'
                : 'Comienza escribiendo en el buscador o usa los filtros'
              }
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            {Object.entries(getGroupedResults()).map(([type, items]) => {
              const typeInfo = availableFilters.types.find(t => t.id === type);
              return (
                <ResultSection
                  key={type}
                  type={type}
                  typeInfo={typeInfo}
                  items={items}
                  searchTerm={searchTerm}
                />
              );
            })}
          </div>
        )}
      </div>
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid #06b6d460',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            color: 'white'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #06b6d430',
              borderTop: '4px solid #06b6d4',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <span style={{ fontSize: '16px', fontWeight: '600' }}>
              Buscando...
            </span>
          </div>
        </div>
      )}

      <style>
        {`@keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }`}
      </style>
    </div>
  );
};

// Componente para cada sección de resultados
const ResultSection = ({ type, typeInfo, items, searchTerm }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
      borderRadius: '16px',
      border: `1px solid ${typeInfo.color}40`,
      overflow: 'hidden'
    }}>
      {/* Section Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '20px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: isExpanded ? '1px solid rgba(148, 163, 184, 0.2)' : 'none'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '24px' }}>{typeInfo.icon}</span>
          <h3 style={{
            color: typeInfo.color,
            fontSize: '20px',
            fontWeight: '700',
            margin: 0
          }}>
            {typeInfo.name}
          </h3>
          <span style={{
            padding: '4px 8px',
            borderRadius: '12px',
            background: `${typeInfo.color}20`,
            color: typeInfo.color,
            fontSize: '12px',
            fontWeight: '600'
          }}>
            {items.length}
          </span>
        </div>
        
        <div style={{
          color: typeInfo.color,
          fontSize: '18px',
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s ease'
        }}>
          ▼
        </div>
      </div>

      {/* Section Content */}
      {isExpanded && (
        <div style={{ padding: '20px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '16px'
          }}>
            {items.map(item => (
              <ResultCard 
                key={`${type}-${item.id}`}
                item={item}
                type={type}
                typeInfo={typeInfo}
                searchTerm={searchTerm}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para cada card de resultado
const ResultCard = ({ item, type, typeInfo, searchTerm }) => {
  const highlightText = (text, highlight) => {
    if (!highlight || !text) return text;
    
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} style={{ 
          background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
          color: '#000',
          padding: '1px 4px',
          borderRadius: '4px',
          fontWeight: '600'
        }}>
          {part}
        </span>
      ) : part
    );
  };

    const handleCardClick = () => {
        console.log(`Navegando a ${type}:`, item);
        // Aquí implementarías la navegación real dependiendo del tipo
        switch (type) {
        case 'category':
            console.log('Abrir gestión de categoría:', item.id);
            break;
        case 'subcategory':
            console.log('Abrir gestión de subcategoría:', item.id);
            break;
        case 'course':
            console.log('Abrir gestión de curso:', item.id);
            break;
        case 'professor':
            console.log('Ver perfil del profesor:', item.id);
            break;
        default:
            break;
        }
    };

  return (
    <div
      onClick={handleCardClick}
      style={{
        background: 'rgba(30, 41, 59, 0.6)',
        borderRadius: '12px',
        border: `1px solid ${typeInfo.color}40`,
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 12px 40px ${typeInfo.color}30`;
        e.currentTarget.style.borderColor = `${typeInfo.color}60`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = `${typeInfo.color}40`;
      }}
    >
      {/* Color accent bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: `linear-gradient(90deg, ${typeInfo.color}, ${typeInfo.color}80)`
      }} />

      {/* Card Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px'
      }}>
        <div style={{ flex: 1 }}>
          <h4 style={{
            color: 'white',
            fontSize: '18px',
            fontWeight: '700',
            margin: 0,
            marginBottom: '4px'
          }}>
            {item.code && (
              <span style={{ color: typeInfo.color, marginRight: '8px' }}>
                {highlightText(item.code, searchTerm)}
              </span>
            )}
            {highlightText(item.name, searchTerm)}
          </h4>
          
          {/* Breadcrumb/Context */}
          {(item.categoryName || item.subcategoryName) && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: '#94a3b8',
              marginBottom: '8px'
            }}>
              {item.categoryName && (
                <>
                  <span>{item.categoryName}</span>
                  {item.subcategoryName && <span>→</span>}
                </>
              )}
              {item.subcategoryName && (
                <span>{item.subcategoryName}</span>
              )}
            </div>
          )}
        </div>

        {/* Type Badge */}
        <span style={{
          padding: '4px 8px',
          borderRadius: '12px',
          background: `${typeInfo.color}20`,
          color: typeInfo.color,
          fontSize: '11px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {typeInfo.name.slice(0, -1)} {/* Remove 's' from plural */}
        </span>
      </div>

      {/* Description */}
      {item.description && (
        <p style={{
          color: '#cbd5e1',
          fontSize: '14px',
          lineHeight: '1.4',
          margin: 0,
          marginBottom: '16px',
          opacity: 0.9
        }}>
          {highlightText(item.description, searchTerm)}
        </p>
      )}

      {/* Specific Information by Type */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        fontSize: '13px'
      }}>
        {/* Category specific info */}
        {type === 'category' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: '#94a3b8' }}>📁</span>
              <span style={{ color: typeInfo.color, fontWeight: '600' }}>
                {item.subcategoriesCount}
              </span>
              <span style={{ color: '#94a3b8' }}>subcategorías</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: '#94a3b8' }}>📚</span>
              <span style={{ color: typeInfo.color, fontWeight: '600' }}>
                {item.coursesCount}
              </span>
              <span style={{ color: '#94a3b8' }}>cursos</span>
            </div>
          </>
        )}

        {/* Subcategory specific info */}
        {type === 'subcategory' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: '#94a3b8' }}>🎯</span>
              <span style={{ color: '#10b981', fontWeight: '600' }}>
                {item.requiredCourses}
              </span>
              <span style={{ color: '#94a3b8' }}>requerido{item.requiredCourses !== 1 ? 's' : ''}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: '#94a3b8' }}>📚</span>
              <span style={{ color: typeInfo.color, fontWeight: '600' }}>
                {item.coursesCount}
              </span>
              <span style={{ color: '#94a3b8' }}>cursos</span>
            </div>
            {item.cycle && (
              <div style={{
                padding: '2px 8px',
                borderRadius: '10px',
                background: `${typeInfo.color}20`,
                color: typeInfo.color,
                fontSize: '11px',
                fontWeight: '600'
              }}>
                Ciclo {item.cycle}
              </div>
            )}
          </>
        )}

        {/* Course specific info */}
        {type === 'course' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: '#94a3b8' }}>⭐</span>
              <span style={{ color: typeInfo.color, fontWeight: '600' }}>
                {item.credits}
              </span>
              <span style={{ color: '#94a3b8' }}>créditos</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: '#94a3b8' }}>⏰</span>
              <span style={{ color: typeInfo.color, fontWeight: '600' }}>
                {item.totalHours}h
              </span>
              <span style={{ color: '#94a3b8' }}>semanales</span>
            </div>
            <div style={{
              padding: '2px 8px',
              borderRadius: '10px',
              background: item.isActive ? '#10b98120' : '#ef444420',
              color: item.isActive ? '#10b981' : '#ef4444',
              fontSize: '11px',
              fontWeight: '600'
            }}>
              {item.isActive ? '✅ Activo' : '❌ Inactivo'}
            </div>
            {item.cycle && (
              <div style={{
                padding: '2px 8px',
                borderRadius: '10px',
                background: `${typeInfo.color}20`,
                color: typeInfo.color,
                fontSize: '11px',
                fontWeight: '600'
              }}>
                Ciclo {item.cycle}
              </div>
            )}
          </>
        )}

        {/* Professor specific info */}
        {type === 'professor' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: '#94a3b8' }}>📚</span>
              <span style={{ color: typeInfo.color, fontWeight: '600' }}>
                {item.totalCourses}
              </span>
              <span style={{ color: '#94a3b8' }}>curso{item.totalCourses !== 1 ? 's' : ''}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: '#94a3b8' }}>📅</span>
              <span style={{ color: typeInfo.color, fontWeight: '600' }}>
                {item.activeCycles.length}
              </span>
              <span style={{ color: '#94a3b8' }}>ciclo{item.activeCycles.length !== 1 ? 's' : ''} activo{item.activeCycles.length !== 1 ? 's' : ''}</span>
            </div>
          </>
        )}
      </div>

      {/* Additional Details */}
      {item.scheduledCycles && item.scheduledCycles.length > 0 && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          background: 'rgba(15, 23, 42, 0.6)',
          borderRadius: '8px',
          fontSize: '12px'
        }}>
          <span style={{ color: '#94a3b8' }}>📅 Ciclos programados: </span>
          <span style={{ color: '#cbd5e1' }}>
            {item.scheduledCycles.join(', ')}
          </span>
        </div>
      )}

      {item.courses && item.courses.length > 0 && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          background: 'rgba(15, 23, 42, 0.6)',
          borderRadius: '8px',
          fontSize: '12px'
        }}>
          <span style={{ color: '#94a3b8' }}>📚 Cursos: </span>
          <span style={{ color: '#cbd5e1' }}>
            {item.courses.join(', ')}
          </span>
        </div>
      )}

      {/* Click indicator */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        right: '12px',
        color: typeInfo.color,
        fontSize: '16px',
        opacity: 0.6
      }}>
        →
      </div>
    </div>
  );
};

export default SearchTab;