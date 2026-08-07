import React, { useState, useEffect } from 'react';
import { SubcategoriesApi } from '../../../services/admin/subcategories/subcategoriesApi';

const AVAILABLE_CYCLES = Array.from({ length: 10 }, (_, i) => i + 1);
const INPUT_CLASS = 'w-full rounded-lg border border-line bg-bg px-4 py-3 text-sm text-ink outline-none focus:border-accent';
const LABEL_CLASS = 'mb-2 block text-sm text-muted';

const SubcategoriesTab = ({ selectedCategory, onSubcategorySelect, onBack }) => {
  const [subcategories, setSubcategories] = useState([]);
  const [coursesBySubcategory, setCoursesBySubcategory] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubcategoryInfo, setSelectedSubcategoryInfo] = useState(null);

  const [showFreezeConfirmation, setShowFreezeConfirmation] = useState(null);
  const [showUnfreezeConfirmation, setShowUnfreezeConfirmation] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(null);
  const [confirmationTimer, setConfirmationTimer] = useState(10);
  const [canConfirm, setCanConfirm] = useState(false);

  const [newSubcategory, setNewSubcategory] = useState({
    name: '', description: '', cycle: 1, requiredCourses: 1, requiresAll: false,
    color: selectedCategory?.color || '#33538C', isHidden: false
  });

  useEffect(() => {
    const loadInitialData = async () => {
      if (!selectedCategory?.id) return;
      try {
        setLoading(true);
        const subcategoriesData = await SubcategoriesApi.getSubcategoriesByCategory(selectedCategory.id);
        setSubcategories(subcategoriesData);

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

  useEffect(() => {
    let timer;
    if ((showFreezeConfirmation || showUnfreezeConfirmation || showDeleteConfirmation) && confirmationTimer > 0) {
      timer = setTimeout(() => setConfirmationTimer(confirmationTimer - 1), 1000);
    } else if (confirmationTimer === 0) {
      setCanConfirm(true);
    }
    return () => clearTimeout(timer);
  }, [showFreezeConfirmation, showUnfreezeConfirmation, showDeleteConfirmation, confirmationTimer]);

  const resetConfirmationState = () => {
    setShowFreezeConfirmation(null);
    setShowUnfreezeConfirmation(null);
    setShowDeleteConfirmation(null);
    setConfirmationTimer(10);
    setCanConfirm(false);
  };

  // El color propio de la subcategoría es data del admin (arbitrario); los
  // estados congelada/oculta usan los tokens del tema.
  const getStatusColor = (subcategory) => {
    if (subcategory.isFrozen || selectedCategory?.isFrozen) return 'var(--t-muted)';
    if (subcategory.isHidden) return 'var(--t-warn)';
    return subcategory.color;
  };

  const getStatusIcon = (subcategory) => {
    if (subcategory.isFrozen || selectedCategory?.isFrozen) return '❄️';
    if (subcategory.isHidden) return '👁️‍🗨️';
    return '✅';
  };

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
      setSubcategories(subcategories.map(sub => (sub.id === editingSubcategory.id ? updatedSubcategory : sub)));
      resetForm();
    } catch (error) {
      setError('Error al actualizar subcategoría');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubcategory = (subcategory) => setShowDeleteConfirmation(subcategory);

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

  const handleFreezeSubcategory = (subcategory) => setShowFreezeConfirmation(subcategory);

  const confirmFreezeSubcategory = async () => {
    const subcategoryToFreeze = showFreezeConfirmation;
    try {
      setLoading(true);
      await SubcategoriesApi.freezeSubcategory(subcategoryToFreeze.id);
      setSubcategories(subcategories.map(sub => (sub.id === subcategoryToFreeze.id ? { ...sub, isFrozen: true } : sub)));
      resetConfirmationState();
    } catch (error) {
      setError(`No se pudo congelar la subcategoría "${subcategoryToFreeze.name}"`);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfreezeSubcategory = (subcategory) => setShowUnfreezeConfirmation(subcategory);

  const confirmUnfreezeSubcategory = async () => {
    const subcategoryToUnfreeze = showUnfreezeConfirmation;
    try {
      setLoading(true);
      await SubcategoriesApi.unfreezeSubcategory(subcategoryToUnfreeze.id);
      setSubcategories(subcategories.map(sub => (sub.id === subcategoryToUnfreeze.id ? { ...sub, isFrozen: false } : sub)));
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
      setSubcategories(subcategories.map(sub => (sub.id === subcategoryId ? updatedSubcategory : sub)));
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
    setNewSubcategory({ name: '', description: '', cycle: 1, requiredCourses: 1, requiresAll: false, color: selectedCategory?.color || '#33538C', isHidden: false });
  };

  const filteredSubcategories = subcategories.filter(subcategory =>
    subcategory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subcategory.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedCategory?.isFrozen) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-muted/30 bg-muted/10 p-16 text-center">
          <div className="mb-4 text-5xl">❄️</div>
          <h3 className="mb-2 text-2xl text-muted">Categoría Congelada</h3>
          <p className="mb-6 text-base text-muted">
            La categoría "{selectedCategory.name}" está congelada. No se pueden realizar acciones en sus subcategorías.
          </p>
          <button
            disabled={loading}
            onClick={onBack}
            className="rounded-lg bg-line px-6 py-3 text-sm text-ink disabled:cursor-not-allowed disabled:opacity-60"
          >
            ← Volver a Categorías
          </button>
        </div>
      </div>
    );
  }

  const categoryColor = selectedCategory?.color || 'var(--t-accent-deep)';

  return (
    <div className="p-8 text-ink">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-3 text-sm text-muted">
        <button disabled={loading} onClick={onBack} className="text-accent underline disabled:opacity-60">📂 Categorías</button>
        <span>→</span>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: categoryColor }} />
          <span className="font-medium text-ink">{selectedCategory?.name || 'Categoría no seleccionada'}</span>
        </div>
      </div>

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="m-0 mb-2 text-2xl font-bold" style={{ color: categoryColor }}>
            📁 Subcategorías de {selectedCategory?.name}
          </h2>
          <p className="m-0 text-base text-muted">{selectedCategory?.description}</p>
        </div>

        <button
          disabled={loading}
          onClick={() => setShowAddForm(true)}
          style={{ background: `linear-gradient(135deg, ${categoryColor}, ${categoryColor}CC)` }}
          className="flex items-center gap-2 rounded-xl px-6 py-3 text-base font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="text-lg">+</span>
          Nueva Subcategoría
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-bad/40 bg-bad/10 p-4 text-bad">{error}</div>
      )}

      <div className="mb-6">
        <input
          disabled={loading}
          type="text"
          placeholder="🔍 Buscar subcategorías..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-line bg-bg px-5 py-4 text-base text-ink outline-none focus:border-accent"
        />
      </div>

      {showAddForm && (
        <SubcategoryForm
          newSubcategory={newSubcategory}
          setNewSubcategory={setNewSubcategory}
          selectedCategory={selectedCategory}
          availableCycles={AVAILABLE_CYCLES}
          editingSubcategory={editingSubcategory}
          onSave={editingSubcategory ? handleUpdateSubcategory : handleAddSubcategory}
          onCancel={resetForm}
          loading={loading}
        />
      )}

      <div className="grid gap-8" style={{ gridTemplateColumns: selectedSubcategoryInfo ? '1fr 400px' : '1fr' }}>
        <div>
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
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
            <div className="p-16 text-center text-muted">
              <div className="mb-4 text-5xl">📁</div>
              <h3 className="mb-2 text-xl text-ink">No se encontraron subcategorías</h3>
              <p className="text-base">{searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza creando tu primera subcategoría'}</p>
            </div>
          )}
        </div>

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

      {(showFreezeConfirmation || showUnfreezeConfirmation || showDeleteConfirmation) && (
        <ConfirmationModal
          type={showFreezeConfirmation ? 'freeze' : showUnfreezeConfirmation ? 'unfreeze' : 'delete'}
          item={showFreezeConfirmation || showUnfreezeConfirmation || showDeleteConfirmation}
          itemType="subcategoría"
          timer={confirmationTimer}
          canConfirm={canConfirm}
          onConfirm={showFreezeConfirmation ? confirmFreezeSubcategory : showUnfreezeConfirmation ? confirmUnfreezeSubcategory : confirmDeleteSubcategory}
          onCancel={resetConfirmationState}
          loading={loading}
        />
      )}

      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-accent/30 bg-surface p-6 text-ink">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent/30 border-t-accent" />
            <span className="text-base font-semibold">Cargando...</span>
          </div>
        </div>
      )}
    </div>
  );
};

const SubcategoryCard = ({
  subcategory, selectedCategory, isSelected, onSelect, onEdit, onDelete, onFreeze, onUnfreeze, onToggleHidden,
  getStatusColor, getStatusIcon, loading
}) => {
  const canDelete = subcategory.coursesCount === 0;
  const isDisabled = subcategory.isFrozen || selectedCategory?.isFrozen;
  const statusColor = getStatusColor(subcategory);

  return (
    <div
      onClick={onSelect}
      style={{
        borderColor: isSelected ? statusColor : `${statusColor}60`,
        boxShadow: isSelected ? `0 8px 30px ${statusColor}40` : 'none',
      }}
      className={`relative overflow-hidden rounded-2xl border-2 bg-surface p-6 transition-all ${
        isDisabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:-translate-y-1'
      } ${isSelected ? 'scale-[1.02]' : ''}`}
    >
      <div className="absolute inset-x-0 top-0 h-1" style={{ background: statusColor }} />
      <div className="absolute right-3 top-3 text-xl">{getStatusIcon(subcategory)}</div>

      <div className="mb-4 flex items-center gap-3">
        <div className="h-3 w-3 rounded-full" style={{ background: statusColor, boxShadow: `0 0 10px ${statusColor}60` }} />
        <h3 className="m-0 text-lg font-bold text-ink">{subcategory.name}</h3>
      </div>

      <p className="mb-5 text-sm leading-relaxed text-muted">{subcategory.description}</p>

      <div className="mb-4 flex flex-wrap gap-2">
        {!isDisabled && (
          <>
            <button disabled={loading} onClick={(e) => { e.stopPropagation(); onEdit(subcategory); }} className="rounded-md bg-good/20 px-3 py-1.5 text-xs font-medium text-good disabled:opacity-60">✏️ Editar</button>
            <button disabled={loading} onClick={(e) => { e.stopPropagation(); onFreeze(subcategory); }} className="rounded-md bg-muted/20 px-3 py-1.5 text-xs font-medium text-muted disabled:opacity-60">❄️ Congelar</button>
            <button
              disabled={loading}
              onClick={(e) => { e.stopPropagation(); onToggleHidden(subcategory.id); }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium disabled:opacity-60 ${subcategory.isHidden ? 'bg-good/20 text-good' : 'bg-warn/20 text-warn'}`}
            >
              {subcategory.isHidden ? '👁️ Mostrar' : '🙈 Ocultar'}
            </button>
          </>
        )}

        {subcategory.isFrozen && !selectedCategory?.isFrozen && (
          <button disabled={loading} onClick={(e) => { e.stopPropagation(); onUnfreeze(subcategory); }} className="rounded-md bg-accent/20 px-3 py-1.5 text-xs font-medium text-accent disabled:opacity-60">🔥 Descongelar</button>
        )}

        {canDelete && !isDisabled && (
          <button disabled={loading} onClick={(e) => { e.stopPropagation(); onDelete(subcategory); }} className="rounded-md bg-bad/20 px-3 py-1.5 text-xs font-medium text-bad disabled:opacity-60">🗑️ Eliminar</button>
        )}
      </div>

      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-muted">
          <div className="flex items-center gap-2">
            <span>📚</span>
            <span className="font-semibold" style={{ color: statusColor }}>{subcategory.coursesCount}</span>
            <span>cursos</span>
          </div>
          <div className="flex items-center gap-2">
            <span>✅</span>
            {subcategory.requiresAll ? (
              <span className="font-semibold text-good">Todos requeridos</span>
            ) : (
              <>
                <span className="font-semibold text-good">{subcategory.requiredCourses}</span>
                <span>requerido{subcategory.requiredCourses !== 1 ? 's' : ''}</span>
              </>
            )}
          </div>
        </div>

        {selectedCategory?.cycleAssociation && (
          <div className="rounded-full px-2 py-1 text-xs font-semibold" style={{ background: `${statusColor}20`, color: statusColor }}>
            Ciclo {subcategory.cycle}
          </div>
        )}
      </div>

      {!canDelete && !isDisabled && (
        <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-bg px-3 py-2 text-xs text-muted">
          <span>⚠️</span>
          No se puede eliminar: tiene cursos asociados
        </div>
      )}

      {isSelected && <div className="absolute bottom-3 right-3 text-sm" style={{ color: statusColor }}>✨ Seleccionada</div>}
      {!isDisabled && !isSelected && <div className="absolute bottom-3 right-3 text-sm opacity-60" style={{ color: statusColor }}>👆 Clic para ver detalles</div>}
    </div>
  );
};

const SubcategoryDetailsPanel = ({ subcategory, courses, selectedCategory, onClose, onNavigateToCourses, getStatusColor, loading }) => {
  const statusColor = getStatusColor(subcategory);
  const isDisabled = subcategory.isFrozen || selectedCategory?.isFrozen;

  return (
    <div className="sticky top-5 h-fit rounded-2xl border bg-surface p-6" style={{ borderColor: `${statusColor}60` }}>
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h3 className="m-0 mb-2 text-xl font-bold" style={{ color: statusColor }}>📁 {subcategory.name}</h3>
          <p className="m-0 text-sm leading-snug text-muted">{subcategory.description}</p>
        </div>
        <button disabled={loading} onClick={onClose} className="rounded-md bg-bg px-2.5 py-1.5 text-sm font-medium text-muted hover:text-ink disabled:opacity-60">✕</button>
      </div>

      <div className="mb-5 flex flex-wrap gap-3">
        <span className="rounded-full px-2 py-1 text-xs font-semibold" style={{ background: `${statusColor}20`, color: statusColor }}>
          {isDisabled ? '❄️ Congelada' : subcategory.isHidden ? '🙈 Oculta' : '✅ Activa'}
        </span>
        {selectedCategory?.cycleAssociation && (
          <span className="rounded-full bg-line/60 px-2 py-1 text-xs font-semibold text-muted">📍 Ciclo {subcategory.cycle}</span>
        )}
        <span className="rounded-full bg-good/20 px-2 py-1 text-xs font-semibold text-good">
          {subcategory.requiresAll ? '✅ Todos requeridos' : `✅ ${subcategory.requiredCourses} requerido${subcategory.requiredCourses !== 1 ? 's' : ''}`}
        </span>
      </div>

      <div className="mb-6 rounded-lg bg-bg p-4 text-center">
        <div className="mb-1 text-2xl font-bold" style={{ color: statusColor }}>{subcategory.coursesCount}</div>
        <div className="text-sm text-muted">Cursos disponibles</div>
      </div>

      <div className="mb-5">
        <h4 className="mb-3 text-base font-semibold text-ink">📚 Cursos</h4>
        {courses.length > 0 ? (
          <div className="flex max-h-[250px] flex-col gap-2 overflow-y-auto">
            {courses.map(course => (
              <div key={course.id} className="rounded-lg bg-bg p-3 transition-colors hover:bg-surface-2" style={{ border: `1px solid ${statusColor}30` }}>
                <div className="mb-1.5 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded px-1.5 py-0.5 text-xs font-semibold" style={{ color: statusColor, background: `${statusColor}20` }}>{course.code}</span>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${course.isActive ? 'bg-good/20 text-good' : 'bg-bad/20 text-bad'}`}>
                      {course.isActive ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-muted">{course.credits} créditos</span>
                </div>
                <div className="text-sm font-medium text-ink">{course.name}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-5 text-center text-sm italic text-muted">No hay cursos registrados</div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={onNavigateToCourses}
          disabled={isDisabled || loading}
          style={{ background: isDisabled ? undefined : `linear-gradient(135deg, ${statusColor}, ${statusColor}80)` }}
          className="flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
        >
          <span>📚</span>
          Ver Cursos
        </button>

        {isDisabled && (
          <div className="rounded-md bg-muted/20 px-3 py-2 text-center text-xs italic text-muted">
            ❄️ Subcategoría congelada - No se pueden realizar acciones
          </div>
        )}
      </div>
    </div>
  );
};

const MODAL_CONFIG = {
  freeze: { colorVar: '--t-muted', colorClass: 'text-muted', bgClass: 'bg-muted', confirmText: 'Congelar' },
  unfreeze: { colorVar: '--t-accent', colorClass: 'text-accent', bgClass: 'bg-accent', confirmText: 'Descongelar' },
  delete: { colorVar: '--t-bad', colorClass: 'text-bad', bgClass: 'bg-bad', confirmText: 'Eliminar' },
};

const ConfirmationModal = ({ type, item, itemType, timer, canConfirm, onConfirm, onCancel, loading }) => {
  const cfg = MODAL_CONFIG[type];
  const texts = {
    freeze: {
      title: `❄️ Congelar ${itemType}`,
      message: `¿Estás seguro de que deseas congelar la ${itemType} "${item.name}"?`,
      warning: `Esta acción congelará en cadena todos los cursos y horarios asociados a esta ${itemType}. No se podrán realizar acciones de edición hasta descongelar.`,
    },
    unfreeze: {
      title: `🔥 Descongelar ${itemType}`,
      message: `¿Estás seguro de que deseas descongelar la ${itemType} "${item.name}"?`,
      warning: `Esta acción descongelará en cadena todos los cursos y horarios asociados a esta ${itemType}.`,
    },
    delete: {
      title: `🗑️ Eliminar ${itemType}`,
      message: `¿Estás seguro de que deseas eliminar la ${itemType} "${item.name}"?`,
      warning: `Esta acción es irreversible. La ${itemType} será eliminada permanentemente.`,
    },
  }[type];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-5 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-2xl border-2 bg-surface p-8" style={{ borderColor: `var(${cfg.colorVar})` }}>
        <h3 className={`mb-4 text-center text-2xl font-bold ${cfg.colorClass}`}>{texts.title}</h3>
        <p className="mb-4 text-center text-base leading-relaxed text-ink">{texts.message}</p>

        <div className="mb-6 rounded-xl border p-4" style={{ borderColor: `var(${cfg.colorVar})30`, background: `var(${cfg.colorVar})15` }}>
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <p className="m-0 text-sm leading-relaxed text-warn">{texts.warning}</p>
          </div>
        </div>

        {timer > 0 && (
          <div className="mb-6 flex justify-center">
            <div className={`flex h-20 w-20 items-center justify-center rounded-full border-4 border-line ${cfg.colorClass}`} style={{ borderTopColor: `var(${cfg.colorVar})` }}>
              <span className="text-2xl font-bold">{timer}</span>
            </div>
          </div>
        )}

        {canConfirm && <div className="mb-5 text-center text-sm font-semibold text-good">✅ Ya puedes confirmar la acción</div>}

        <div className="flex justify-center gap-3">
          <button disabled={loading} onClick={onCancel} className="rounded-lg border border-line px-6 py-3 text-sm font-semibold text-muted hover:bg-bg disabled:opacity-60">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={!canConfirm || loading}
            className={`rounded-lg px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-line disabled:text-muted ${canConfirm ? cfg.bgClass : ''}`}
          >
            {cfg.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubcategoriesTab;

const SubcategoryForm = ({ newSubcategory, setNewSubcategory, selectedCategory, availableCycles, editingSubcategory, onSave, onCancel, loading }) => {
  const categoryColor = selectedCategory?.color || 'var(--t-accent-deep)';
  return (
    <div className="mb-6 rounded-2xl border p-6" style={{ borderColor: `${categoryColor}40`, background: `${categoryColor}0D` }}>
      <h3 className="mb-5 text-xl font-semibold text-accent">
        {editingSubcategory ? '✏️ Editar Subcategoría' : '✨ Nueva Subcategoría'}
      </h3>

      <div className="mb-5 grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        <div>
          <label className={LABEL_CLASS}>Nombre de la subcategoría</label>
          <input
            disabled={loading}
            type="text"
            value={newSubcategory.name}
            onChange={(e) => setNewSubcategory({ ...newSubcategory, name: e.target.value })}
            placeholder="Ej: Electivo de Humanidades 1, Electivo de IA..."
            className={INPUT_CLASS}
          />
        </div>

        {selectedCategory?.cycleAssociation && (
          <div>
            <label className={LABEL_CLASS}>Ciclo asociado</label>
            <select
              disabled={loading}
              value={newSubcategory.cycle}
              onChange={(e) => setNewSubcategory({ ...newSubcategory, cycle: parseInt(e.target.value) })}
              className={INPUT_CLASS}
            >
              {availableCycles.map(cycle => (
                <option key={cycle} value={cycle}>Ciclo {cycle}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className={LABEL_CLASS}>Cursos requeridos</label>
          <input
            disabled={loading || newSubcategory.requiresAll}
            type="number"
            min="1"
            max="10"
            value={newSubcategory.requiredCourses}
            onChange={(e) => setNewSubcategory({ ...newSubcategory, requiredCourses: parseInt(e.target.value) })}
            className={INPUT_CLASS}
          />
          <div className="mt-2 flex items-center gap-2">
            <input
              disabled={loading}
              type="checkbox"
              id="requiresAll"
              checked={newSubcategory.requiresAll}
              onChange={(e) => setNewSubcategory({ ...newSubcategory, requiresAll: e.target.checked })}
              className="h-4 w-4 cursor-pointer accent-good"
            />
            <label htmlFor="requiresAll" className="cursor-pointer select-none text-xs text-ink">Requiere todos los cursos (p. ej. obligatorios)</label>
          </div>
          <p className="mt-1 text-xs italic text-muted">
            {newSubcategory.requiresAll
              ? 'El alumno debe aprobar todos los cursos que existan en esta subcategoría, incluso si se agregan más adelante.'
              : 'Número de cursos que el estudiante debe aprobar de esta subcategoría.'}
          </p>
        </div>
      </div>

      <div className="mb-5">
        <label className={LABEL_CLASS}>Descripción</label>
        <textarea
          disabled={loading}
          value={newSubcategory.description}
          onChange={(e) => setNewSubcategory({ ...newSubcategory, description: e.target.value })}
          placeholder="Describe los cursos que abarca esta subcategoría y su objetivo académico..."
          rows={3}
          className={`${INPUT_CLASS} min-h-[80px] resize-y`}
        />
      </div>

      <div className="mb-5">
        <div className="flex items-center gap-3">
          <input
            disabled={loading}
            type="checkbox"
            id="isHidden"
            checked={newSubcategory.isHidden}
            onChange={(e) => setNewSubcategory({ ...newSubcategory, isHidden: e.target.checked })}
            className="h-[18px] w-[18px] cursor-pointer accent-warn"
          />
          <label htmlFor="isHidden" className="cursor-pointer select-none text-sm text-ink">Ocultar subcategoría (no visible para estudiantes)</label>
        </div>
        <p className="ml-[30px] mt-1 text-xs italic text-muted">
          {newSubcategory.isHidden ? 'Los estudiantes no podrán ver esta subcategoría al registrar cursos' : 'La subcategoría será visible para los estudiantes'}
        </p>
      </div>

      <div className="flex justify-end gap-3">
        <button disabled={loading} onClick={onCancel} className="rounded-lg border border-line px-5 py-2.5 text-sm text-muted hover:bg-bg disabled:opacity-60">
          Cancelar
        </button>
        <button
          onClick={onSave}
          disabled={!newSubcategory.name.trim() || loading}
          style={{ background: !newSubcategory.name.trim() ? undefined : `linear-gradient(135deg, ${categoryColor}, ${categoryColor}CC)` }}
          className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
        >
          {editingSubcategory ? 'Actualizar' : 'Crear'} Subcategoría
        </button>
      </div>
    </div>
  );
};
