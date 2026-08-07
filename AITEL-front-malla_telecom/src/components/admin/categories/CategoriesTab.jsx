import React, { useState, useEffect } from 'react';
import { CategoriesApi } from '../../../services/admin/categories/categoriesApi';

const INPUT_CLASS = 'w-full rounded-lg border border-line bg-bg px-4 py-3 text-sm text-ink outline-none focus:border-accent';
const LABEL_CLASS = 'mb-2 block text-sm text-muted';

const CategoriesTab = ({ onCategorySelect }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [subcategoriesByCategory, setSubcategoriesByCategory] = useState({});

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryInfo, setSelectedCategoryInfo] = useState(null);

  const [showFreezeConfirmation, setShowFreezeConfirmation] = useState(null);
  const [showUnfreezeConfirmation, setShowUnfreezeConfirmation] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(null);
  const [confirmationTimer, setConfirmationTimer] = useState(10);
  const [canConfirm, setCanConfirm] = useState(false);

  const [newCategory, setNewCategory] = useState({
    name: '', description: '', cycleAssociation: true, color: '#1979C3', isHidden: false
  });

  const colorOptions = ['#1979C3', '#33538C', '#4C7A4E', '#2E8B57', '#C97A1D', '#B23A34', '#E8A94A', '#0B3B5C'];

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const categoriesData = await CategoriesApi.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        setError('Error al cargar categorías');
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) return;
    setLoading(true);
    try {
      const savedCategory = await CategoriesApi.createCategory(newCategory);
      setCategories([...categories, savedCategory]);
      resetForm();
    } catch (error) {
      setError('Error al crear categoría');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategory({ ...category });
    setShowAddForm(true);
  };

  const handleUpdateCategory = async () => {
    try {
      setLoading(true);
      const updatedCategory = await CategoriesApi.updateCategory(editingCategory.id, newCategory);
      setCategories(categories.map(cat => (cat.id === editingCategory.id ? updatedCategory : cat)));
      resetForm();
    } catch (error) {
      setError('Error al actualizar la categoría');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = (category) => setShowDeleteConfirmation(category);

  const confirmDeleteCategory = async () => {
    const categoryToDelete = showDeleteConfirmation;
    try {
      setLoading(true);
      await CategoriesApi.deleteCategory(categoryToDelete.id);
      setCategories(categories.filter(cat => cat.id !== categoryToDelete.id));
      resetConfirmationState();
    } catch (error) {
      setError(`No se pudo eliminar la categoría "${categoryToDelete.name}"`);
    } finally {
      setLoading(false);
    }
  };

  const handleFreezeCategory = (category) => setShowFreezeConfirmation(category);

  const confirmFreezeCategory = async () => {
    const categoryToFreeze = showFreezeConfirmation;
    try {
      setLoading(true);
      await CategoriesApi.freezeCategory(categoryToFreeze.id);
      setCategories(categories.map(cat => (cat.id === showFreezeConfirmation.id ? { ...cat, isFrozen: true } : cat)));
    } catch (error) {
      setError(`No se pudo congelar la categoría "${categoryToFreeze.name}"`);
    } finally {
      setLoading(false);
      resetConfirmationState();
    }
  };

  const handleUnfreezeCategory = (category) => setShowUnfreezeConfirmation(category);

  const confirmUnfreezeCategory = async () => {
    const categoryToUnfreeze = showUnfreezeConfirmation;
    try {
      setLoading(true);
      await CategoriesApi.unfreezeCategory(categoryToUnfreeze.id);
      setCategories(categories.map(cat => (cat.id === showUnfreezeConfirmation.id ? { ...cat, isFrozen: false } : cat)));
    } catch (error) {
      setError(`No se pudo descongelar la categoría "${categoryToUnfreeze.name}"`);
    } finally {
      setLoading(false);
      resetConfirmationState();
    }
  };

  const handleToggleHidden = async (categoryId) => {
    try {
      setLoading(true);
      const updatedCategory = await CategoriesApi.toggleHideCategory(categoryId);
      setCategories(categories.map(cat => (cat.id === categoryId ? updatedCategory : cat)));
    } catch (error) {
      setError('No se pudo ocultar/desocultar la categoría');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    if (category.isFrozen) return;
    if (selectedCategoryInfo?.id === category.id) {
      onCategorySelect(category);
    } else {
      setSelectedCategoryInfo(category);
    }
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingCategory(null);
    setNewCategory({ name: '', description: '', cycleAssociation: true, color: '#1979C3', isHidden: false });
  };

  // El color propio de la categoría es data del admin (arbitrario); los
  // estados congelada/oculta usan los tokens del tema, no un color fijo.
  const getStatusColor = (category) => {
    if (category.isFrozen) return 'var(--t-muted)';
    if (category.isHidden) return 'var(--t-warn)';
    return category.color;
  };

  const getStatusIcon = (category) => {
    if (category.isFrozen) return '❄️';
    if (category.isHidden) return '👁️‍🗨️';
    return '✅';
  };

  return (
    <div className="p-8 text-ink">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="m-0 mb-2 font-display text-2xl font-bold text-ink">📂 Gestión de Categorías</h2>
          <p className="m-0 text-base text-muted">Define y organiza las categorías principales de los cursos</p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-base font-semibold text-ink-on-accent transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="text-lg">+</span>
          Nueva Categoría
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Buscar categorías..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-line bg-bg px-5 py-4 text-base text-ink outline-none focus:border-accent"
        />
      </div>

      {showAddForm && (
        <CategoryForm
          newCategory={newCategory}
          setNewCategory={setNewCategory}
          colorOptions={colorOptions}
          editingCategory={editingCategory}
          onSave={editingCategory ? handleUpdateCategory : handleAddCategory}
          onCancel={resetForm}
          loading={loading}
        />
      )}

      <div className="grid gap-8" style={{ gridTemplateColumns: selectedCategoryInfo ? '1fr 400px' : '1fr' }}>
        <div>
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
            {filteredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                isSelected={selectedCategoryInfo?.id === category.id}
                onSelect={() => handleCategoryClick(category)}
                onEdit={() => handleEditCategory(category)}
                onDelete={() => handleDeleteCategory(category)}
                onFreeze={() => handleFreezeCategory(category)}
                onUnfreeze={() => handleUnfreezeCategory(category)}
                onToggleHidden={() => handleToggleHidden(category.id)}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
                loading={loading}
              />
            ))}
          </div>

          {filteredCategories.length === 0 && (
            <div className="p-16 text-center text-muted">
              <div className="mb-4 text-5xl">🔍</div>
              <h3 className="mb-2 text-xl text-ink">No se encontraron categorías</h3>
              <p className="text-base">{searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza creando tu primera categoría'}</p>
            </div>
          )}
        </div>

        {selectedCategoryInfo && (
          <CategoryDetailsPanel
            category={selectedCategoryInfo}
            subcategories={subcategoriesByCategory[selectedCategoryInfo.id] || []}
            loading={loading}
            onClose={() => setSelectedCategoryInfo(null)}
            onNavigateToSubcategories={() => onCategorySelect(selectedCategoryInfo)}
            getStatusColor={getStatusColor}
          />
        )}
      </div>

      {(showFreezeConfirmation || showUnfreezeConfirmation || showDeleteConfirmation) && (
        <ConfirmationModal
          type={showFreezeConfirmation ? 'freeze' : showUnfreezeConfirmation ? 'unfreeze' : 'delete'}
          category={showFreezeConfirmation || showUnfreezeConfirmation || showDeleteConfirmation}
          timer={confirmationTimer}
          canConfirm={canConfirm}
          onConfirm={showFreezeConfirmation ? confirmFreezeCategory : showUnfreezeConfirmation ? confirmUnfreezeCategory : confirmDeleteCategory}
          onCancel={resetConfirmationState}
        />
      )}

      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-accent/30 bg-surface p-6 text-ink">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent/30 border-t-accent" />
            <span className="text-base font-semibold">Procesando...</span>
          </div>
        </div>
      )}
    </div>
  );
};

const CategoryForm = ({ newCategory, setNewCategory, colorOptions, editingCategory, onSave, onCancel, loading }) => (
  <div className="mb-6 rounded-2xl border border-accent/30 bg-accent/5 p-6">
    <h3 className="mb-5 text-xl font-semibold text-accent">
      {editingCategory ? '✏️ Editar Categoría' : '✨ Nueva Categoría'}
    </h3>

    <div className="mb-5 grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
      <div>
        <label className={LABEL_CLASS}>Nombre de la categoría</label>
        <input
          type="text"
          value={newCategory.name}
          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
          placeholder="Ej: Especialización, Formación General..."
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Asociación por ciclo</label>
        <div className="flex items-center gap-3 py-3">
          <input
            type="checkbox"
            id="cycleAssociation"
            checked={newCategory.cycleAssociation}
            onChange={(e) => setNewCategory({ ...newCategory, cycleAssociation: e.target.checked })}
            className="h-[18px] w-[18px] cursor-pointer accent-accent"
          />
          <label htmlFor="cycleAssociation" className="cursor-pointer select-none text-sm text-ink">
            Las subcategorías se asocian a ciclos específicos
          </label>
        </div>
      </div>
    </div>

    <div className="mb-5">
      <label className={LABEL_CLASS}>Descripción</label>
      <textarea
        value={newCategory.description}
        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
        placeholder="Describe el propósito y alcance de esta categoría..."
        rows={3}
        className={`${INPUT_CLASS} min-h-[80px] resize-y`}
      />
    </div>

    <div className="mb-5">
      <label className={LABEL_CLASS}>Color identificativo</label>
      <div className="flex flex-wrap gap-3">
        {colorOptions.map(color => (
          <button
            key={color}
            onClick={() => setNewCategory({ ...newCategory, color })}
            style={{
              background: color,
              boxShadow: newCategory.color === color ? `0 0 20px ${color}40` : 'none',
            }}
            className={`h-10 w-10 rounded-lg transition-all ${
              newCategory.color === color ? 'border-[3px] border-ink' : 'border-2 border-line'
            }`}
          />
        ))}
      </div>
    </div>

    <div className="mb-5">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isHidden"
          checked={newCategory.isHidden}
          onChange={(e) => setNewCategory({ ...newCategory, isHidden: e.target.checked })}
          className="h-[18px] w-[18px] cursor-pointer accent-warn"
        />
        <label htmlFor="isHidden" className="cursor-pointer select-none text-sm text-ink">
          Ocultar categoría (no visible para estudiantes)
        </label>
      </div>
    </div>

    <div className="flex justify-end gap-3">
      <button onClick={onCancel} className="rounded-lg border border-line px-5 py-2.5 text-sm text-muted hover:bg-bg">
        Cancelar
      </button>
      <button
        onClick={onSave}
        disabled={loading}
        className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-ink-on-accent disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Guardando...' : `${editingCategory ? 'Actualizar' : 'Crear'} Categoría`}
      </button>
    </div>
  </div>
);

const CategoryCard = ({
  category, isSelected, onSelect, onEdit, onDelete, onFreeze, onUnfreeze, onToggleHidden,
  getStatusColor, getStatusIcon, loading
}) => {
  const canDelete = category.subcategoriesCount === 0 && category.coursesCount === 0;
  const statusColor = getStatusColor(category);

  return (
    <div
      onClick={onSelect}
      style={{
        borderColor: isSelected ? statusColor : `${statusColor}60`,
        boxShadow: isSelected ? `0 8px 30px ${statusColor}40` : 'none',
      }}
      className={`relative overflow-hidden rounded-2xl border-2 bg-surface p-6 transition-all ${
        category.isFrozen ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:-translate-y-1'
      } ${isSelected ? 'scale-[1.02]' : ''}`}
    >
      <div className="absolute inset-x-0 top-0 h-1" style={{ background: statusColor }} />
      <div className="absolute right-3 top-3 text-xl">{getStatusIcon(category)}</div>

      <div className="mb-4 flex items-center gap-3">
        <div className="h-3 w-3 rounded-full" style={{ background: statusColor, boxShadow: `0 0 10px ${statusColor}60` }} />
        <h3 className="m-0 text-xl font-bold text-ink">{category.name}</h3>
      </div>

      <p className="mb-5 text-sm leading-relaxed text-muted">{category.description}</p>

      <div className="mb-4 flex flex-wrap gap-2">
        {!category.isFrozen && (
          <>
            <button
              disabled={loading}
              onClick={(e) => { e.stopPropagation(); onEdit(category); }}
              className="rounded-md bg-good/20 px-3 py-1.5 text-xs font-medium text-good disabled:cursor-not-allowed disabled:opacity-60"
            >
              ✏️ Editar
            </button>
            <button
              disabled={loading}
              onClick={(e) => { e.stopPropagation(); onFreeze(category); }}
              className="rounded-md bg-muted/20 px-3 py-1.5 text-xs font-medium text-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              ❄️ Congelar
            </button>
            <button
              disabled={loading}
              onClick={(e) => { e.stopPropagation(); onToggleHidden(category.id); }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60 ${
                category.isHidden ? 'bg-good/20 text-good' : 'bg-warn/20 text-warn'
              }`}
            >
              {category.isHidden ? '👁️ Mostrar' : '🙈 Ocultar'}
            </button>
          </>
        )}

        {category.isFrozen && (
          <button
            disabled={loading}
            onClick={(e) => { e.stopPropagation(); onUnfreeze(category); }}
            className="rounded-md bg-accent/20 px-3 py-1.5 text-xs font-medium text-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            🔥 Descongelar
          </button>
        )}

        {canDelete && !category.isFrozen && (
          <button
            disabled={loading}
            onClick={(e) => { e.stopPropagation(); onDelete(category); }}
            className="rounded-md bg-bad/20 px-3 py-1.5 text-xs font-medium text-bad disabled:cursor-not-allowed disabled:opacity-60"
          >
            🗑️ Eliminar
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-muted">
          <div className="flex items-center gap-2">
            <span>📁</span>
            <span className="font-semibold" style={{ color: statusColor }}>{category.subcategoriesCount}</span>
            <span>subcategorías</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📚</span>
            <span className="font-semibold" style={{ color: statusColor }}>{category.coursesCount}</span>
            <span>cursos</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted">
          {category.cycleAssociation ? (<><span>🔗</span><span>Por ciclo</span></>) : (<><span>🌐</span><span>Transversal</span></>)}
        </div>
      </div>

      {!canDelete && !category.isFrozen && (
        <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-bg px-3 py-2 text-xs text-muted">
          <span>⚠️</span>
          No se puede eliminar: tiene {category.subcategoriesCount > 0 ? 'subcategorías' : 'cursos'} asociados
        </div>
      )}

      {isSelected && (
        <div className="absolute bottom-3 right-3 text-sm" style={{ color: statusColor }}>✨ Seleccionada</div>
      )}
      {!category.isFrozen && !isSelected && (
        <div className="absolute bottom-3 right-3 text-sm opacity-60" style={{ color: statusColor }}>👆 Clic para ver detalles</div>
      )}
    </div>
  );
};

const CategoryDetailsPanel = ({ category, subcategories, onClose, onNavigateToSubcategories, getStatusColor, loading }) => {
  const statusColor = getStatusColor(category);
  return (
    <div className="sticky top-5 h-fit rounded-2xl border bg-surface p-6" style={{ borderColor: `${statusColor}60` }}>
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h3 className="m-0 mb-2 text-xl font-bold" style={{ color: statusColor }}>📂 {category.name}</h3>
          <p className="m-0 text-sm leading-snug text-muted">{category.description}</p>
        </div>
        <button onClick={onClose} className="rounded-md bg-bg px-2.5 py-1.5 text-sm font-medium text-muted hover:text-ink">✕</button>
      </div>

      <div className="mb-5 flex flex-wrap gap-3">
        <span className="rounded-full px-2 py-1 text-xs font-semibold" style={{ background: `${statusColor}20`, color: statusColor }}>
          {category.isFrozen ? '❄️ Congelada' : category.isHidden ? '🙈 Oculta' : '✅ Activa'}
        </span>
        <span className="rounded-full bg-line/60 px-2 py-1 text-xs font-semibold text-muted">
          {category.cycleAssociation ? '🔗 Por ciclo' : '🌐 Transversal'}
        </span>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-bg p-3 text-center">
          <div className="mb-1 text-xl font-bold" style={{ color: statusColor }}>{category.subcategoriesCount}</div>
          <div className="text-xs text-muted">Subcategorías</div>
        </div>
        <div className="rounded-lg bg-bg p-3 text-center">
          <div className="mb-1 text-xl font-bold" style={{ color: statusColor }}>{category.coursesCount}</div>
          <div className="text-xs text-muted">Cursos</div>
        </div>
      </div>

      <div className="mb-5">
        <h4 className="mb-3 text-base font-semibold text-ink">📁 Subcategorías</h4>
        {subcategories.length > 0 ? (
          <div className="flex max-h-[200px] flex-col gap-2 overflow-y-auto">
            {subcategories.map(subcategory => (
              <div
                key={subcategory.id}
                className="flex items-center justify-between rounded-lg bg-bg px-3 py-2.5 transition-colors hover:bg-surface-2"
                style={{ border: `1px solid ${statusColor}30` }}
              >
                <span className="text-sm font-medium text-ink">{subcategory.name}</span>
                <span className="text-xs font-semibold" style={{ color: statusColor }}>{subcategory.coursesCount} cursos</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-5 text-center text-sm italic text-muted">No hay subcategorías registradas</div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={onNavigateToSubcategories}
          disabled={category.isFrozen || loading}
          style={{ background: category.isFrozen || loading ? undefined : `linear-gradient(135deg, ${statusColor}, ${statusColor}80)` }}
          className="flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
        >
          <span>📁</span>
          Ver Subcategorías
        </button>

        {category.isFrozen && (
          <div className="rounded-md bg-muted/20 px-3 py-2 text-center text-xs italic text-muted">
            ❄️ Categoría congelada - No se pueden realizar acciones
          </div>
        )}
      </div>
    </div>
  );
};

const MODAL_CONFIG = {
  freeze: { title: '❄️ Congelar Categoría', confirmText: 'Congelar', colorVar: '--t-muted', colorClass: 'text-muted', bgClass: 'bg-muted' },
  unfreeze: { title: '🔥 Descongelar Categoría', confirmText: 'Descongelar', colorVar: '--t-accent', colorClass: 'text-accent', bgClass: 'bg-accent' },
  delete: { title: '🗑️ Eliminar Categoría', confirmText: 'Eliminar', colorVar: '--t-bad', colorClass: 'text-bad', bgClass: 'bg-bad' },
};

const ConfirmationModal = ({ type, category, timer, canConfirm, onConfirm, onCancel }) => {
  const cfg = MODAL_CONFIG[type];
  const messages = {
    freeze: { message: `¿Estás seguro de que deseas congelar la categoría "${category.name}"?`, warning: 'Esta acción congelará en cadena todas las subcategorías, cursos y horarios asociados. No se podrán realizar acciones de edición hasta descongelar.' },
    unfreeze: { message: `¿Estás seguro de que deseas descongelar la categoría "${category.name}"?`, warning: 'Esta acción descongelará en cadena todas las subcategorías, cursos y horarios asociados.' },
    delete: { message: `¿Estás seguro de que deseas eliminar la categoría "${category.name}"?`, warning: 'Esta acción es irreversible. La categoría será eliminada permanentemente.' },
  }[type];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-5 backdrop-blur-md">
      <div className={`w-full max-w-lg rounded-2xl border-2 bg-surface p-8`} style={{ borderColor: `var(${cfg.colorVar})` }}>
        <h3 className={`mb-4 text-center text-2xl font-bold ${cfg.colorClass}`}>{cfg.title}</h3>
        <p className="mb-4 text-center text-base leading-relaxed text-ink">{messages.message}</p>

        <div className={`mb-6 rounded-xl border p-4`} style={{ borderColor: `var(${cfg.colorVar})30`, background: `var(${cfg.colorVar})15` }}>
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <p className="m-0 text-sm leading-relaxed text-warn">{messages.warning}</p>
          </div>
        </div>

        {timer > 0 && (
          <div className="mb-6 flex justify-center">
            <div className={`flex h-20 w-20 items-center justify-center rounded-full border-4 border-line ${cfg.colorClass}`} style={{ borderTopColor: `var(${cfg.colorVar})` }}>
              <span className="text-2xl font-bold">{timer}</span>
            </div>
          </div>
        )}

        {canConfirm && (
          <div className="mb-5 text-center text-sm font-semibold text-good">✅ Ya puedes confirmar la acción</div>
        )}

        <div className="flex justify-center gap-3">
          <button onClick={onCancel} className="rounded-lg border border-line px-6 py-3 text-sm font-semibold text-muted hover:bg-bg">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={!canConfirm}
            className={`rounded-lg px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-line disabled:text-muted ${canConfirm ? cfg.bgClass : ''}`}
          >
            {cfg.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoriesTab;
