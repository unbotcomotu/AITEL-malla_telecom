import React, { useState, useEffect } from 'react';
import { SubcategoriesApi } from '../../../services/admin/subcategories/subcategoriesApi';
const SubcategoriesTab = ({ selectedCategory, onSubcategorySelect, onBack }) => {
  // Mock data para subcategorías
  const [subcategories, setSubcategories] = useState([]);

  // Mock data para cursos
  const [coursesBySubcategory, setCoursesBySubcategory] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados del componente
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubcategoryInfo, setSelectedSubcategoryInfo] = useState(null);
  
  // Estados para modales de confirmación
  const [showFreezeConfirmation, setShowFreezeConfirmation] = useState(null);
  const [showUnfreezeConfirmation, setShowUnfreezeConfirmation] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(null);
  const [confirmationTimer, setConfirmationTimer] = useState(10);
  const [canConfirm, setCanConfirm] = useState(false);
  
  const [newSubcategory, setNewSubcategory] = useState({
    name: '',
    description: '',
    cycle: 1,
    requiredCourses: 1,
    color: selectedCategory?.color || '#8b5cf6',
    isHidden: false
  });

  useEffect(() => {
    const loadInitialData = async () => {
      if (!selectedCategory?.id) return;
      
      try {
        setLoading(true);
        const subcategoriesData = await SubcategoriesApi.getSubcategoriesByCategory(selectedCategory.id);
        setSubcategories(subcategoriesData);
        
        // Cargar cursos para cada subcategoría
        const coursesPromises = subcategoriesData.map(sub => 
          SubcategoriesApi.getSubcategoryCourses(sub.id)
            .then(courses => ({ subcategoryId: sub.id, courses }))
            .catch(() => ({ subcategoryId: sub.id, courses: [] }))
        );
        
        const coursesResults = await Promise.all(coursesPromises);
        const coursesMap = coursesResults.reduce((acc, { subcategoryId, courses }) => {
          acc[subcategoryId] = courses;
          return acc;
        }, {});
        
        setCoursesBySubcategory(coursesMap);
        
      } catch (error) {
        setError('Error al cargar subcategorías');
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, [selectedCategory?.id]);

  // Timer effect para confirmaciones
  useEffect(() => {
    let timer;
    if ((showFreezeConfirmation || showUnfreezeConfirmation || showDeleteConfirmation) && confirmationTimer > 0) {
      timer = setTimeout(() => {
        setConfirmationTimer(confirmationTimer - 1);
      }, 1000);
    } else if (confirmationTimer === 0) {
      setCanConfirm(true);
    }
    return () => clearTimeout(timer);
  }, [showFreezeConfirmation, showUnfreezeConfirmation, showDeleteConfirmation, confirmationTimer]);

  // Funciones auxiliares
  const resetConfirmationState = () => {
    setShowFreezeConfirmation(null);
    setShowUnfreezeConfirmation(null);
    setShowDeleteConfirmation(null);
    setConfirmationTimer(10);
    setCanConfirm(false);
  };

  const getStatusColor = (subcategory) => {
    if (subcategory.isFrozen || selectedCategory?.isFrozen) return '#64748b';
    if (subcategory.isHidden) return '#f59e0b';
    return subcategory.color;
  };

  const getStatusIcon = (subcategory) => {
    if (subcategory.isFrozen || selectedCategory?.isFrozen) return '❄️';
    if (subcategory.isHidden) return '👁️‍🗨️';
    return '✅';
  };

  // Handlers
  const handleAddSubcategory = async () => {
    if (!newSubcategory.name.trim()) return;
    
    try {
      setLoading(true);
      const savedSubcategory = await SubcategoriesApi.createSubcategory(selectedCategory.id, newSubcategory);
      setSubcategories([...subcategories, savedSubcategory]);
      resetForm();
    } catch (error) {
      setError('Error al crear subcategoría');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubcategory = (subcategory) => {
    setEditingSubcategory(subcategory);
    setNewSubcategory({ ...subcategory });
    setShowAddForm(true);
  };

  const handleUpdateSubcategory = async () => {
    try {
      setLoading(true);
      const updatedSubcategory = await SubcategoriesApi.updateSubcategory(editingSubcategory.id, newSubcategory);
      setSubcategories(subcategories.map(sub => 
        sub.id === editingSubcategory.id ? updatedSubcategory : sub
      ));
      resetForm();
    } catch (error) {
      setError('Error al actualizar subcategoría');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubcategory = (subcategory) => {
    setShowDeleteConfirmation(subcategory);
  };

  const confirmDeleteSubcategory = async () => {
    const subcategoryToDelete = showDeleteConfirmation;
    try {
      setLoading(true);
      await SubcategoriesApi.deleteSubcategory(subcategoryToDelete.id);
      setSubcategories(subcategories.filter(sub => sub.id !== subcategoryToDelete.id));
      resetConfirmationState();
    } catch (error) {
      setError(`No se pudo eliminar la subcategoría "${subcategoryToDelete.name}"`);
    } finally {
      setLoading(false);
    }
  };

  const handleFreezeSubcategory = (subcategory) => {
    setShowFreezeConfirmation(subcategory);
  };

  const confirmFreezeSubcategory = async () => {
    const subcategoryToFreeze = showFreezeConfirmation;
    try {
      setLoading(true);
      await SubcategoriesApi.freezeSubcategory(subcategoryToFreeze.id);
      setSubcategories(subcategories.map(sub => 
        sub.id === subcategoryToFreeze.id ? { ...sub, isFrozen: true } : sub
      ));
      resetConfirmationState();
    } catch (error) {
      setError(`No se pudo congelar la subcategoría "${subcategoryToFreeze.name}"`);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfreezeSubcategory = (subcategory) => {
    setShowUnfreezeConfirmation(subcategory);
  };

  const confirmUnfreezeSubcategory = async () => {
    const subcategoryToUnfreeze = showUnfreezeConfirmation;
    try {
      setLoading(true);
      await SubcategoriesApi.unfreezeSubcategory(subcategoryToUnfreeze.id);
      setSubcategories(subcategories.map(sub => 
        sub.id === subcategoryToUnfreeze.id ? { ...sub, isFrozen: false } : sub
      ));
      resetConfirmationState();
    } catch (error) {
      setError(`No se pudo descongelar la subcategoría "${subcategoryToUnfreeze.name}"`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleHidden = async (subcategoryId) => {
    try {
      setLoading(true);
      const updatedSubcategory = await SubcategoriesApi.toggleSubcategoryVisibility(subcategoryId);
      setSubcategories(subcategories.map(sub => 
        sub.id === subcategoryId ? updatedSubcategory : sub
      ));
    } catch (error) {
      setError('No se pudo cambiar la visibilidad de la subcategoría');
    } finally {
      setLoading(false);
    }
  };

  const handleSubcategoryClick = (subcategory) => {
    if (subcategory.isFrozen || selectedCategory?.isFrozen || loading) return;
    
    if (selectedSubcategoryInfo?.id === subcategory.id) {
      onSubcategorySelect(subcategory);
    } else {
      setSelectedSubcategoryInfo(subcategory);
    }
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingSubcategory(null);
    setNewSubcategory({
      name: '',
      description: '',
      cycle: 1,
      requiredCourses: 1,
      color: selectedCategory?.color || '#8b5cf6',
      isHidden: false
    });
  };

  // Filtros
  const filteredSubcategories = subcategories.filter(subcategory =>
    subcategory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subcategory.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Si la categoría padre está congelada
  if (selectedCategory?.isFrozen) {
    return (
      <div style={{ padding: '32px' }}>
        <div style={{
          textAlign: 'center',
          padding: '64px 24px',
          background: 'rgba(100, 116, 139, 0.1)',
          borderRadius: '16px',
          border: '1px solid rgba(100, 116, 139, 0.3)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❄️</div>
          <h3 style={{ fontSize: '24px', marginBottom: '8px', color: '#64748b' }}>
            Categoría Congelada
          </h3>
          <p style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '24px' }}>
            La categoría "{selectedCategory.name}" está congelada. No se pueden realizar acciones en sus subcategorías.
          </p>
          <button
            disabled={loading}
            onClick={onBack}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(148, 163, 184, 0.3)',
              color: '#cbd5e1',
              cursor: 'pointer',
              fontSize: '14px',
              opacity: loading ? 0.6 : 1
            }}
          >
            ← Volver a Categorías
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px' }}>
      {/* Breadcrumb Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px',
        fontSize: '14px',
        color: '#94a3b8'
      }}>
        <button
          disabled={loading}
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: '#06b6d4',
            cursor: 'pointer',
            fontSize: '14px',
            textDecoration: 'underline',
            opacity: loading ? 0.6 : 1
          }}
        >
          📂 Categorías
        </button>
        <span>→</span>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: selectedCategory?.color || '#8b5cf6'
          }} />
          <span style={{ color: 'white', fontWeight: '500' }}>
            {selectedCategory?.name || 'Categoría no seleccionada'}
          </span>
        </div>
      </div>

      {/* Header Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            background: `linear-gradient(to right, ${selectedCategory?.color || '#8b5cf6'}, ${selectedCategory?.color || '#8b5cf6'}80)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            marginBottom: '8px'
          }}>
            📁 Subcategorías de {selectedCategory?.name}
          </h2>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '16px' }}>
            {selectedCategory?.description}
          </p>
        </div>
        
        <button
          disabled={loading}
          onClick={() => setShowAddForm(true)}
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            background: `linear-gradient(135deg, ${selectedCategory?.color || '#8b5cf6'}, ${selectedCategory?.color || '#8b5cf6'}80)`,
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
            boxShadow: `0 4px 15px ${selectedCategory?.color || '#8b5cf6'}30`,
            opacity: loading ? 0.6 : 1
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <span style={{ fontSize: '18px' }}>+</span>
          Nueva Subcategoría
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '24px' }}>
        <input
          disabled={loading}
          type="text"
          placeholder="🔍 Buscar subcategorías..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            background: 'rgba(30, 41, 59, 0.6)',
            color: 'white',
            fontSize: '16px',
            backdropFilter: 'blur(10px)',
            outline: 'none',
            transition: 'all 0.3s ease'
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = selectedCategory?.color || '#8b5cf6'}
          onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)'}
        />
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <SubcategoryForm
          newSubcategory={newSubcategory}
          setNewSubcategory={setNewSubcategory}
          selectedCategory={selectedCategory}
          editingSubcategory={editingSubcategory}
          onSave={editingSubcategory ? handleUpdateSubcategory : handleAddSubcategory}
          onCancel={resetForm}
          loading={loading}
        />
      )}

      {/* Main Content Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: selectedSubcategoryInfo ? '1fr 400px' : '1fr',
        gap: '32px'
      }}>
        
        {/* Subcategories Grid */}
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '24px'
          }}>
            {filteredSubcategories.map((subcategory) => (
              <SubcategoryCard
                key={subcategory.id}
                subcategory={subcategory}
                selectedCategory={selectedCategory}
                isSelected={selectedSubcategoryInfo?.id === subcategory.id}
                onSelect={() => handleSubcategoryClick(subcategory)}
                onEdit={() => handleEditSubcategory(subcategory)}
                onDelete={() => handleDeleteSubcategory(subcategory)}
                onFreeze={() => handleFreezeSubcategory(subcategory)}
                onUnfreeze={() => handleUnfreezeSubcategory(subcategory)}
                onToggleHidden={() => handleToggleHidden(subcategory.id)}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
                loading={loading}
              />
            ))}
          </div>

          {filteredSubcategories.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '64px 24px',
              color: '#94a3b8'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>
                No se encontraron subcategorías
              </h3>
              <p style={{ fontSize: '16px' }}>
                {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza creando tu primera subcategoría'}
              </p>
            </div>
          )}
        </div>

        {/* Subcategory Details Panel */}
        {selectedSubcategoryInfo && (
          <SubcategoryDetailsPanel
            subcategory={selectedSubcategoryInfo}
            courses={coursesBySubcategory[selectedSubcategoryInfo.id] || []}
            selectedCategory={selectedCategory}
            onClose={() => setSelectedSubcategoryInfo(null)}
            onNavigateToCourses={() => onSubcategorySelect(selectedSubcategoryInfo)}
            getStatusColor={getStatusColor}
            loading={loading}
          />
        )}
      </div>

      {/* Confirmation Modals */}
      {(showFreezeConfirmation || showUnfreezeConfirmation || showDeleteConfirmation) && (
        <ConfirmationModal
          type={showFreezeConfirmation ? 'freeze' : showUnfreezeConfirmation ? 'unfreeze' : 'delete'}
          item={showFreezeConfirmation || showUnfreezeConfirmation || showDeleteConfirmation}
          timer={confirmationTimer}
          canConfirm={canConfirm}
          onConfirm={showFreezeConfirmation ? confirmFreezeSubcategory : showUnfreezeConfirmation ? confirmUnfreezeSubcategory : confirmDeleteSubcategory}
          onCancel={resetConfirmationState}
          loading={loading}
        />
      )}
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
              Cargando...
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

const SubcategoryCard = ({ 
  subcategory, selectedCategory, isSelected, onSelect, onEdit, onDelete, onFreeze, onUnfreeze, onToggleHidden,
  getStatusColor, getStatusIcon,loading
}) => {
  const canDelete = subcategory.coursesCount === 0;
  const isDisabled = subcategory.isFrozen || selectedCategory?.isFrozen;
  
  return (
    <div
      onClick={onSelect}
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
        borderRadius: '16px',
        border: `2px solid ${isSelected ? getStatusColor(subcategory) : `${getStatusColor(subcategory)}60`}`,
        padding: '24px',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.7 : 1,
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isSelected ? `0 8px 30px ${getStatusColor(subcategory)}40` : 'none'
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = isSelected ? 'scale(1.02)' : 'translateY(-4px)';
          e.currentTarget.style.boxShadow = `0 12px 40px ${getStatusColor(subcategory)}40`;
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = isSelected ? 'scale(1.02)' : 'translateY(0)';
          e.currentTarget.style.boxShadow = isSelected ? `0 8px 30px ${getStatusColor(subcategory)}40` : 'none';
        }
      }}
    >
      {/* Color accent bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: `linear-gradient(90deg, ${getStatusColor(subcategory)}, ${getStatusColor(subcategory)}80)`
      }} />
      
      {/* Status indicator */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        fontSize: '20px'
      }}>
        {getStatusIcon(subcategory)}
      </div>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: getStatusColor(subcategory),
            boxShadow: `0 0 10px ${getStatusColor(subcategory)}60`
          }} />
          <h3 style={{
            color: 'white',
            fontSize: '18px',
            fontWeight: '700',
            margin: 0
          }}>
            {subcategory.name}
          </h3>
        </div>
      </div>

      <p style={{
        color: '#cbd5e1',
        fontSize: '14px',
        lineHeight: '1.5',
        marginBottom: '20px',
        opacity: 0.9
      }}>
        {subcategory.description}
      </p>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        marginBottom: '16px'
      }}>
        {!isDisabled && (
          <>
            <button
              disabled={loading}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(subcategory);
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#10b981',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                opacity: loading ? 0.6 : 1
              }}
            >
              ✏️ Editar
            </button>

            <button
              disabled={loading}
              onClick={(e) => {
                e.stopPropagation();
                onFreeze(subcategory);
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: 'rgba(100, 116, 139, 0.2)',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                opacity: loading ? 0.6 : 1
              }}
            >
              ❄️ Congelar
            </button>

            <button
              disabled={loading}
              onClick={(e) => {
                e.stopPropagation();
                onToggleHidden(subcategory.id);
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: subcategory.isHidden ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                color: subcategory.isHidden ? '#10b981' : '#f59e0b',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                opacity: loading ? 0.6 : 1
              }}
            >
              {subcategory.isHidden ? '👁️ Mostrar' : '🙈 Ocultar'}
            </button>
          </>
        )}

        {subcategory.isFrozen && !selectedCategory?.isFrozen && (
          <button
            disabled={loading}
            onClick={(e) => {
              e.stopPropagation();
              onUnfreeze(subcategory);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: 'rgba(6, 182, 212, 0.2)',
              color: '#06b6d4',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              opacity: loading ? 0.6 : 1
            }}
          >
            🔥 Descongelar
          </button>
        )}

        {canDelete && !isDisabled && (
          <button
            disabled={loading}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(subcategory);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              opacity: loading ? 0.6 : 1
            }}
          >
            🗑️ Eliminar
          </button>
        )}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#94a3b8',
            fontSize: '14px'
          }}>
            <span>📚</span>
            <span style={{ fontWeight: '600', color: getStatusColor(subcategory) }}>
              {subcategory.coursesCount}
            </span>
            <span>cursos</span>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#94a3b8',
            fontSize: '14px'
          }}>
            <span>✅</span>
            <span style={{ fontWeight: '600', color: '#10b981' }}>
              {subcategory.requiredCourses}
            </span>
            <span>requerido{subcategory.requiredCourses !== 1 ? 's' : ''}</span>
          </div>
        </div>
        
        {selectedCategory?.cycleAssociation && (
          <div style={{
            padding: '4px 8px',
            borderRadius: '12px',
            background: `${getStatusColor(subcategory)}20`,
            color: getStatusColor(subcategory),
            fontSize: '12px',
            fontWeight: '600'
          }}>
            Ciclo {subcategory.cycle}
          </div>
        )}
      </div>

      {!canDelete && !isDisabled && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          borderRadius: '8px',
          background: 'rgba(71, 85, 105, 0.2)',
          fontSize: '12px',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span>⚠️</span>
          No se puede eliminar: tiene cursos asociados
        </div>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          color: getStatusColor(subcategory),
          fontSize: '16px',
          animation: 'pulse 2s infinite'
        }}>
          ✨ Seleccionada
        </div>
      )}

      {/* Click indicator for enabled subcategories */}
      {!isDisabled && !isSelected && (
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          color: getStatusColor(subcategory),
          fontSize: '16px',
          opacity: 0.6
        }}>
          👆 Clic para ver detalles
        </div>
      )}
    </div>
  );
};

// Componente para el panel de detalles de subcategoría
const SubcategoryDetailsPanel = ({ subcategory, courses, selectedCategory, onClose, onNavigateToCourses, getStatusColor,loading}) => (
  <div style={{
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
    borderRadius: '16px',
    border: `1px solid ${getStatusColor(subcategory)}60`,
    padding: '24px',
    height: 'fit-content',
    position: 'sticky',
    top: '20px'
  }}>
    {/* Header */}
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '20px'
    }}>
      <div>
        <h3 style={{
          color: getStatusColor(subcategory),
          fontSize: '20px',
          fontWeight: '700',
          margin: 0,
          marginBottom: '8px'
        }}>
          📁 {subcategory.name}
        </h3>
        <p style={{
          color: '#94a3b8',
          fontSize: '14px',
          margin: 0,
          lineHeight: '1.4'
        }}>
          {subcategory.description}
        </p>
      </div>
      
      <button
        disabled={loading}
        onClick={onClose}
        style={{
          background: 'rgba(148, 163, 184, 0.2)',
          border: 'none',
          borderRadius: '6px',
          color: '#94a3b8',
          cursor: 'pointer',
          fontSize: '14px',
          padding: '6px 10px',
          fontWeight: '500',
          opacity: loading ? 0.6 : 1
        }}
      >
        ✕
      </button>
    </div>

    {/* Status Info */}
    <div style={{
      display: 'flex',
      gap: '12px',
      marginBottom: '20px',
      flexWrap: 'wrap'
    }}>
      <span style={{
        padding: '4px 8px',
        borderRadius: '12px',
        background: `${getStatusColor(subcategory)}20`,
        color: getStatusColor(subcategory),
        fontSize: '12px',
        fontWeight: '600'
      }}>
        {subcategory.isFrozen || selectedCategory?.isFrozen ? '❄️ Congelada' : subcategory.isHidden ? '🙈 Oculta' : '✅ Activa'}
      </span>
      
      {selectedCategory?.cycleAssociation && (
        <span style={{
          padding: '4px 8px',
          borderRadius: '12px',
          background: 'rgba(148, 163, 184, 0.2)',
          color: '#94a3b8',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          📍 Ciclo {subcategory.cycle}
        </span>
      )}

      <span style={{
        padding: '4px 8px',
        borderRadius: '12px',
        background: 'rgba(16, 185, 129, 0.2)',
        color: '#10b981',
        fontSize: '12px',
        fontWeight: '600'
      }}>
        ✅ {subcategory.requiredCourses} requerido{subcategory.requiredCourses !== 1 ? 's' : ''}
      </span>
    </div>

    {/* Statistics */}
    <div style={{
      padding: '16px',
      borderRadius: '8px',
      background: 'rgba(30, 41, 59, 0.6)',
      textAlign: 'center',
      marginBottom: '24px'
    }}>
      <div style={{
        fontSize: '24px',
        fontWeight: '700',
        color: getStatusColor(subcategory),
        marginBottom: '4px'
      }}>
        {subcategory.coursesCount}
      </div>
      <div style={{
        fontSize: '14px',
        color: '#94a3b8'
      }}>
        Cursos disponibles
      </div>
    </div>

    {/* Courses List */}
    <div style={{ marginBottom: '20px' }}>
      <h4 style={{
        color: '#cbd5e1',
        fontSize: '16px',
        fontWeight: '600',
        marginBottom: '12px'
      }}>
        📚 Cursos
      </h4>
      
      {courses.length > 0 ? (
        <div style={{
          maxHeight: '250px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {courses.map(course => (
            <div
              key={course.id}
              style={{
                padding: '12px',
                borderRadius: '8px',
                background: 'rgba(30, 41, 59, 0.4)',
                border: `1px solid ${getStatusColor(subcategory)}30`,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)'}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '6px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{
                    color: getStatusColor(subcategory),
                    fontSize: '12px',
                    fontWeight: '600',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: `${getStatusColor(subcategory)}20`
                  }}>
                    {course.code}
                  </span>
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: course.isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: course.isActive ? '#10b981' : '#ef4444',
                    fontSize: '10px',
                    fontWeight: '600'
                  }}>
                    {course.isActive ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                </div>
                <span style={{
                  color: '#94a3b8',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {course.credits} créditos
                </span>
              </div>
              <div style={{
                color: '#cbd5e1',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {course.name}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: '14px',
          fontStyle: 'italic'
        }}>
          No hay cursos registrados
        </div>
      )}
    </div>

    {/* Actions */}
    <div style={{
      display: 'flex',
      gap: '12px',
      flexDirection: 'column'
    }}>
      <button
        onClick={onNavigateToCourses}
        disabled={subcategory.isFrozen || selectedCategory?.isFrozen || loading}
        style={{
          padding: '12px 20px',
          borderRadius: '8px',
          border: 'none',
          background: (subcategory.isFrozen || selectedCategory?.isFrozen)
            ? 'rgba(148, 163, 184, 0.3)' 
            : `linear-gradient(135deg, ${getStatusColor(subcategory)}, ${getStatusColor(subcategory)}80)`,
          color: 'white',
          cursor: (subcategory.isFrozen || selectedCategory?.isFrozen) ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          opacity: (subcategory.isFrozen || selectedCategory?.isFrozen || loading) ? 0.5 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        <span>📚</span>
        Ver Cursos
      </button>
      
      {(subcategory.isFrozen || selectedCategory?.isFrozen) && (
        <div style={{
          padding: '8px 12px',
          borderRadius: '6px',
          background: 'rgba(100, 116, 139, 0.2)',
          color: '#64748b',
          fontSize: '12px',
          textAlign: 'center',
          fontStyle: 'italic'
        }}>
          ❄️ Subcategoría congelada - No se pueden realizar acciones
        </div>
      )}
    </div>
  </div>
);

// Componente para modales de confirmación
const ConfirmationModal = ({ type, item, itemType, timer, canConfirm, onConfirm, onCancel,loading}) => {
  const getModalConfig = () => {
    switch (type) {
      case 'freeze':
        return {
          title: `❄️ Congelar ${itemType}`,
          message: `¿Estás seguro de que deseas congelar la ${itemType} "${item.name}"?`,
          warning: `Esta acción congelará en cadena todos los cursos y horarios asociados a esta ${itemType}. No se podrán realizar acciones de edición hasta descongelar.`,
          confirmText: 'Congelar',
          color: '#64748b'
        };
      case 'unfreeze':
        return {
          title: `🔥 Descongelar ${itemType}`,
          message: `¿Estás seguro de que deseas descongelar la ${itemType} "${item.name}"?`,
          warning: `Esta acción descongelará en cadena todos los cursos y horarios asociados a esta ${itemType}.`,
          confirmText: 'Descongelar',
          color: '#06b6d4'
        };
      case 'delete':
        return {
          title: `🗑️ Eliminar ${itemType}`,
          message: `¿Estás seguro de que deseas eliminar la ${itemType} "${item.name}"?`,
          warning: `Esta acción es irreversible. La ${itemType} será eliminada permanentemente.`,
          confirmText: 'Eliminar',
          color: '#ef4444'
        };
      default:
        return {};
    }
  };

  const config = getModalConfig();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
        borderRadius: '20px',
        border: `2px solid ${config.color}60`,
        padding: '32px',
        maxWidth: '500px',
        width: '100%',
        position: 'relative',
        animation: 'modalSlideIn 0.3s ease-out'
      }}>
        {/* Animated border */}
        <div style={{
          position: 'absolute',
          top: '-2px',
          left: '-2px',
          right: '-2px',
          bottom: '-2px',
          borderRadius: '20px',
          background: `linear-gradient(45deg, ${config.color}, transparent, ${config.color})`,
          zIndex: -1,
          animation: 'borderGlow 2s linear infinite'
        }} />

        <h3 style={{
          color: config.color,
          fontSize: '24px',
          fontWeight: '700',
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          {config.title}
        </h3>

        <p style={{
          color: '#cbd5e1',
          fontSize: '16px',
          lineHeight: '1.5',
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          {config.message}
        </p>

        <div style={{
          padding: '16px',
          borderRadius: '12px',
          background: `${config.color}15`,
          border: `1px solid ${config.color}30`,
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <span style={{
              fontSize: '20px',
              animation: 'pulse 2s infinite'
            }}>
              ⚠️
            </span>
            <p style={{
              color: '#fbbf24',
              fontSize: '14px',
              lineHeight: '1.4',
              margin: 0
            }}>
              {config.warning}
            </p>
          </div>
        </div>

        {/* Timer Circle */}
        {timer > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '24px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: `4px solid ${config.color}30`,
              borderTop: `4px solid ${config.color}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'spin 1s linear infinite',
              position: 'relative'
            }}>
              <span style={{
                color: config.color,
                fontSize: '24px',
                fontWeight: '700'
              }}>
                {timer}
              </span>
            </div>
          </div>
        )}

        {canConfirm && (
          <div style={{
            textAlign: 'center',
            marginBottom: '20px',
            color: '#10b981',
            fontSize: '14px',
            fontWeight: '600',
            animation: 'fadeIn 0.5s ease-in'
          }}>
            ✅ Ya puedes confirmar la acción
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <button
            disabled={loading}
            onClick={onCancel}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              background: 'transparent',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              opacity: loading ? 0.6 : 1
            }}
          >
            Cancelar
          </button>
          
          <button
            onClick={onConfirm}
            disabled={!canConfirm || loading}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: canConfirm 
                ? `linear-gradient(135deg, ${config.color}, ${config.color}80)` 
                : 'rgba(148, 163, 184, 0.3)',
              color: 'white',
              cursor: canConfirm ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '600',
              opacity: !canConfirm || loading ? 0.6 : 1,
              transition: 'all 0.3s ease'
            }}
          >
            {config.confirmText}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-50px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes borderGlow {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default SubcategoriesTab;
// Componente para el formulario de subcategorías
const SubcategoryForm = ({ newSubcategory, setNewSubcategory, selectedCategory, availableCycles, editingSubcategory, onSave, onCancel,loading }) => (
  <div style={{
    background: `linear-gradient(135deg, ${selectedCategory?.color || '#8b5cf6'}15 0%, rgba(30, 41, 59, 0.8) 100%)`,
    borderRadius: '16px',
    border: `1px solid ${selectedCategory?.color || '#8b5cf6'}40`,
    padding: '24px',
    marginBottom: '24px',
    backdropFilter: 'blur(10px)'
  }}>
    <h3 style={{
      color: '#67e8f9',
      marginBottom: '20px',
      fontSize: '20px',
      fontWeight: '600'
    }}>
      {editingSubcategory ? '✏️ Editar Subcategoría' : '✨ Nueva Subcategoría'}
    </h3>
    
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '20px'
    }}>
      <div>
        <label style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
          Nombre de la subcategoría
        </label>
        <input
          disabled={loading}
          type="text"
          value={newSubcategory.name}
          onChange={(e) => setNewSubcategory({...newSubcategory, name: e.target.value})}
          placeholder="Ej: Electivo de Humanidades 1, Electivo de IA..."
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            background: 'rgba(15, 23, 42, 0.6)',
            color: 'white',
            fontSize: '14px',
            outline: 'none'
          }}
        />
      </div>
      
      {selectedCategory?.cycleAssociation && (
        <div>
          <label style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
            Ciclo asociado
          </label>
          <select
            disabled={loading}
            value={newSubcategory.cycle}
            onChange={(e) => setNewSubcategory({...newSubcategory, cycle: parseInt(e.target.value)})}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              background: 'rgba(15, 23, 42, 0.6)',
              color: 'white',
              fontSize: '14px',
              outline: 'none'
            }}
          >
            {availableCycles.map(cycle => (
              <option key={cycle} value={cycle}>Ciclo {cycle}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
          Cursos requeridos
        </label>
        <input
          disabled={loading}
          type="number"
          min="1"
          max="10"
          value={newSubcategory.requiredCourses}
          onChange={(e) => setNewSubcategory({...newSubcategory, requiredCourses: parseInt(e.target.value)})}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            background: 'rgba(15, 23, 42, 0.6)',
            color: 'white',
            fontSize: '14px',
            outline: 'none'
          }}
        />
        <p style={{ 
          color: '#94a3b8', 
          fontSize: '12px', 
          margin: '4px 0 0 0',
          fontStyle: 'italic'
        }}>
          Número de cursos que el estudiante debe aprobar de esta subcategoría
        </p>
      </div>
    </div>

    <div style={{ marginBottom: '20px' }}>
      <label style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
        Descripción
      </label>
      <textarea
        disabled={loading}
        value={newSubcategory.description}
        onChange={(e) => setNewSubcategory({...newSubcategory, description: e.target.value})}
        placeholder="Describe los cursos que abarca esta subcategoría y su objetivo académico..."
        rows={3}
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid rgba(148, 163, 184, 0.3)',
          background: 'rgba(15, 23, 42, 0.6)',
          color: 'white',
          fontSize: '14px',
          outline: 'none',
          resize: 'vertical',
          minHeight: '80px'
        }}
      />
    </div>

    {/* Visibilidad */}
    <div style={{ marginBottom: '20px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <input
          disabled={loading}
          type="checkbox"
          id="isHidden"
          checked={newSubcategory.isHidden}
          onChange={(e) => setNewSubcategory({...newSubcategory, isHidden: e.target.checked})}
          style={{
            width: '18px',
            height: '18px',
            accentColor: '#f59e0b',
            cursor: 'pointer'
          }}
        />
        <label 
          htmlFor="isHidden"
          style={{ 
            color: '#cbd5e1', 
            fontSize: '14px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          Ocultar subcategoría (no visible para estudiantes)
        </label>
      </div>
      <p style={{ 
        color: '#94a3b8', 
        fontSize: '12px', 
        margin: '4px 0 0 30px',
        fontStyle: 'italic'
      }}>
        {newSubcategory.isHidden 
          ? 'Los estudiantes no podrán ver esta subcategoría al registrar cursos'
          : 'La subcategoría será visible para los estudiantes'
        }
      </p>
    </div>

    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
      <button
        disabled={loading}
        onClick={onCancel}
        style={{
          padding: '10px 20px',
          borderRadius: '8px',
          border: '1px solid rgba(148, 163, 184, 0.3)',
          background: 'transparent',
          color: '#94a3b8',
          cursor: 'pointer',
          fontSize: '14px',
          opacity: loading ? 0.6 : 1
        }}
      >
        Cancelar
      </button>
      <button
        onClick={onSave}
        disabled={!newSubcategory.name.trim() || loading}
        style={{
          padding: '10px 20px',
          borderRadius: '8px',
          border: 'none',
          background: !newSubcategory.name.trim() 
            ? 'rgba(148, 163, 184, 0.3)' 
            : `linear-gradient(135deg, ${selectedCategory?.color || '#8b5cf6'}, ${selectedCategory?.color || '#8b5cf6'}80)`,
          color: 'white',
          cursor: !newSubcategory.name.trim() ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          opacity: !newSubcategory.name.trim() || loading ? 0.5 : 1
        }}
      >
        {editingSubcategory ? 'Actualizar' : 'Crear'} Subcategoría
      </button>
    </div>
  </div>
);