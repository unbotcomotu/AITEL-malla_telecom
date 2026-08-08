import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
  MiniMap,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { checkPrerequisites } from '../../../utils/prerequisiteUtils.js';
import CourseNode from './CourseNode.jsx';
import CourseDetailPanel from './CourseDetailPanel.jsx';
import { StudentApi } from '../../../services/student/studentApi.js';
import { CurriculumApi } from '../../../services/student/curriculumApi.js';

const nodeTypes = {
  courseNode: CourseNode
};

// Posicion de los handles de CourseNode (circulo fijo de 140x140, ver
// CourseNode.jsx), declarada a mano por la misma razon que width/height mas
// abajo: React Flow normalmente mide los <Handle> del DOM via ResizeObserver,
// y ese observer nunca dispara en este entorno - sin esto, getEdgePosition()
// nunca encuentra bounds validos y ninguna arista se dibuja (quedan en el
// estado con datos correctos, pero 0 elementos <svg> en el DOM).
const COURSE_NODE_HANDLES = [
  { type: 'target', position: Position.Left, x: 0, y: 70 },
  { type: 'source', position: Position.Right, x: 140, y: 70 },
];

// Color de respaldo por si algun curso quedara sin subcategoria (no deberia
// pasar con los datos reales, pero evita un nodo sin color por completo).
const DEFAULT_NODE_COLOR = '#1979C3';

function CurriculumView() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [curriculumData, setCurriculumData] = useState(null);
  const [semesterHistory, setSemesterHistory] = useState([]);
  const [studentData, setStudentData] = useState({
    currentCourses: [],
    currentSemester: '',
    studentInfo: null
  });

  const currentCourses = studentData.currentCourses;
  const currentSemester = studentData.currentSemester;
  // currentCourses llega como objetos {id, code, name, ...} desde el backend,
  // no como una lista plana de ids.
  const currentCourseIds = useMemo(() =>
    new Set((studentData.currentCourses || []).map(c => c.id)),
    [studentData.currentCourses]
  );

  // Historial del alumno aplanado por curso: semester-history ya trae, por
  // cada curso llevado, la nota, si fue con excepcion (bypass de prerrequisito)
  // y si es electivo/su subcategoria - todo lo que hace falta para decidir
  // colores, flechas y el nodo-resumen de cada subcategoria electiva.
  const courseHistoryById = useMemo(() => {
    const map = new Map();
    for (const semester of semesterHistory) {
      for (const course of semester.courses || []) {
        // Un curso desaprobado y repetido aparece 2 veces en el historial;
        // nos quedamos con la nota mas alta (la version "vigente").
        const existing = map.get(course.id);
        if (!existing || (course.grade ?? -1) > (existing.grade ?? -1)) {
          map.set(course.id, course);
        }
      }
    }
    return map;
  }, [semesterHistory]);

  // courseGrades plano (id -> nota), formato que ya espera checkPrerequisites.
  const courseGrades = useMemo(() => {
    const map = {};
    courseHistoryById.forEach((entry, id) => {
      map[id] = entry.grade;
    });
    return map;
  }, [courseHistoryById]);

  // Cursos electivos ya llevados, agrupados por subcategoria - para saber que
  // nombre mostrar en el nodo-resumen de cada subcategoria electiva.
  const takenElectivesBySubcategory = useMemo(() => {
    const map = new Map();
    courseHistoryById.forEach((entry) => {
      if (entry.isElective && entry.subcategoryId != null) {
        const list = map.get(entry.subcategoryId) || [];
        list.push(entry);
        map.set(entry.subcategoryId, list);
      }
    });
    return map;
  }, [courseHistoryById]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [curriculum, academic, history] = await Promise.all([
        CurriculumApi.getCurriculum(),
        StudentApi.getAcademicInfo(),
        StudentApi.getSemesterHistory()
      ]);

      setCurriculumData(curriculum);
      setSemesterHistory(history || []);
      setStudentData({
        currentCourses: academic.currentCourses || [],
        currentSemester: academic.currentSemester || 'No disponible',
        studentInfo: academic.studentInfo || null
      });
    } catch (err) {
      setError(`Error al cargar datos: ${err.message}`);
      console.error('Error cargando datos iniciales:', err);
    } finally {
      setLoading(false);
    }
  };

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    if (!curriculumData) {
      return { nodes: [], edges: [] };
    }

    // "Obligatorio" = sin subcategoria, o con una subcategoria que exige
    // TODOS sus cursos (subcategoryRequiresAll) - ej. "Cursos de EEGGCC",
    // "Redes de Acceso": son tracks tematicos, no una eleccion. Se muestran
    // como nodo individual con sus flechas de prerrequisito.
    // "Electivo" = subcategoria que exige elegir N de sus cursos
    // (requiresAll=false) - se colapsan en un solo nodo-resumen por
    // subcategoria (el usuario confirmo que las electivas nunca son
    // prerrequisito de nada, asi que no necesitan flechas propias).
    const isElectiveCourse = (node) => node.subcategoryId != null && node.subcategoryRequiresAll === false;

    const mandatoryCourses = curriculumData.nodes.filter((n) => !isElectiveCourse(n));
    const electiveCourses = curriculumData.nodes.filter(isElectiveCourse);
    const mandatoryIds = new Set(mandatoryCourses.map((n) => n.id));

    const nodeColor = (subcategoryColor) => subcategoryColor || DEFAULT_NODE_COLOR;

    // Agrupar las electivas por subcategoria para armar un solo nodo-resumen
    // por cada una (en vez de un nodo por curso electivo individual).
    const electiveGroups = new Map();
    for (const course of electiveCourses) {
      const group = electiveGroups.get(course.subcategoryId) || {
        subcategoryId: course.subcategoryId,
        subcategoryName: course.subcategoryName,
        subcategoryColor: course.subcategoryColor,
        subcategoryCycle: course.subcategoryCycle,
        courseCycles: [],
      };
      group.courseCycles.push(course.cycle);
      electiveGroups.set(course.subcategoryId, group);
    }

    // Entradas "logicas" a posicionar: cursos obligatorios + un nodo-resumen
    // por subcategoria electiva. Se calcula el layout de todas juntas para
    // que no se superpongan si comparten ciclo.
    const entries = [
      ...mandatoryCourses.map((node) => ({ kind: 'course', node })),
      ...Array.from(electiveGroups.values()).map((group) => ({ kind: 'elective', group })),
    ];

    const entryCycle = (entry) => entry.kind === 'course'
      ? entry.node.cycle
      // La subcategoria puede declarar su propio ciclo para ubicarse en la
      // malla; si no lo hace, se aproxima con el ciclo mas bajo entre sus
      // cursos reales.
      : (entry.group.subcategoryCycle ?? Math.min(...entry.group.courseCycles));

    const entriesByCycle = new Map();
    entries.forEach((entry) => {
      const cycle = entryCycle(entry);
      const list = entriesByCycle.get(cycle) || [];
      list.push(entry);
      entriesByCycle.set(cycle, list);
    });

    const nodes = entries.map((entry) => {
      const cycle = entryCycle(entry);
      const indexInCycle = entriesByCycle.get(cycle).indexOf(entry);
      const position = { x: cycle * 300, y: indexInCycle * 180 + 50 };

      if (entry.kind === 'elective') {
        const group = entry.group;
        const taken = takenElectivesBySubcategory.get(group.subcategoryId) || [];
        const isApproved = taken.length > 0;
        // Si llevo mas de un curso de la subcategoria (llevo mas de los
        // requeridos), se muestran todos los nombres.
        const label = isApproved ? taken.map((c) => c.name).join(', ') : group.subcategoryName;

        return {
          id: `elective-${group.subcategoryId}`,
          type: 'courseNode',
          width: 140,
          height: 140,
          handles: COURSE_NODE_HANDLES,
          position,
          data: {
            label,
            credits: null,
            cycle,
            status: isApproved ? 'approved' : 'locked',
            color: nodeColor(group.subcategoryColor),
            isPlaceholder: true,
            id: `elective-${group.subcategoryId}`,
            onClick: null,
          },
        };
      }

      const node = entry.node;
      const history = courseHistoryById.get(node.id);
      const isApproved = (history?.grade ?? -1) >= 11;
      const isInProgress = currentCourseIds.has(node.id);
      const prerequisites = checkPrerequisites(
        node.id,
        courseGrades,
        curriculumData.edges,
        curriculumData.nodes,
        curriculumData.prerequisiteTypes
      );
      const arePrerequisitesMet = prerequisites.every(p => p.isMet);

      let status = 'locked';
      if (isApproved) {
        status = 'approved';
      } else if (isInProgress) {
        status = 'in_progress';
      } else if (arePrerequisitesMet || prerequisites.length === 0) {
        status = 'available';
      }

      return {
        id: node.id,
        type: 'courseNode',
        // CourseNode siempre mide 140x140 (circulo fijo, ver CourseNode.jsx).
        // Se declara explicito en vez de depender de que ReactFlow lo mida
        // solo via ResizeObserver - en algunos entornos (pestaña en segundo
        // plano, ciertos navegadores) ese primer callback nunca llega, y sin
        // dimensiones "nodesInitialized" nunca se vuelve true: toda la malla
        // queda con visibility:hidden aunque los nodos esten bien renderizados.
        width: 140,
        height: 140,
        handles: COURSE_NODE_HANDLES,
        position,
        data: {
          label: node.name,
          credits: node.credits,
          cycle: node.cycle,
          status,
          color: nodeColor(node.subcategoryColor),
          isPlaceholder: false,
          id: node.id,
          onClick: (data) => {
            setSelectedCourse(data);
            setIsPanelOpen(true);
          }
        },
      };
    });

    const PREREQUISITE_TYPES = curriculumData.prerequisiteTypes || {};

    const edges = curriculumData.edges
      // Las electivas nunca son prerrequisito de nada (confirmado), pero se
      // filtra por seguridad: solo se dibujan flechas entre cursos
      // obligatorios, que son los unicos que aparecen como nodo individual.
      .filter((edge) => mandatoryIds.has(edge.source) && mandatoryIds.has(edge.target))
      .filter((edge) => {
        // Regla de excepcion: si el curso destino se registro con excepcion
        // (se salto este prerrequisito por permiso especial) la flecha no se
        // muestra - hasta que el alumno apruebe el prerrequisito de todas
        // formas, momento en el que vuelve a ser una flecha "normal".
        const targetHistory = courseHistoryById.get(edge.target);
        const sourceApproved = (courseHistoryById.get(edge.source)?.grade ?? -1) >= 11;
        return !(targetHistory?.exception && !sourceApproved);
      })
      .map((edge) => {
        let strokeVar = '--t-accent';
        let strokeDasharray = 'none';

        switch (edge.type) {
          case PREREQUISITE_TYPES.APPROVED:
            strokeVar = '--t-good';
            break;
          case PREREQUISITE_TYPES.MIN_GRADE:
            strokeVar = '--t-warn';
            break;
          case PREREQUISITE_TYPES.COREQUISITE:
            strokeVar = '--t-accent';
            strokeDasharray = '8,4';
            break;
          default:
            strokeVar = '--t-muted';
        }

        return {
          ...edge,
          type: 'smoothstep',
          markerEnd: { type: 'arrowclosed' },
          style: {
            stroke: `var(${strokeVar})`,
            strokeWidth: 2,
            strokeDasharray: strokeDasharray,
          },
          animated: edge.type === PREREQUISITE_TYPES.COREQUISITE
        };
      });

    return { nodes, edges };
  }, [curriculumData, courseHistoryById, courseGrades, currentCourseIds, takenElectivesBySubcategory]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);
  const reactFlowInstance = useRef(null);

  // useNodesState/useEdgesState solo toman su valor inicial una vez; sin este
  // efecto, el grafo queda vacío la primera vez porque layoutedNodes/Edges
  // se recalculan de forma asincrona (recien cuando termina de cargar
  // curriculumData) y nunca se copian al estado real que consume ReactFlow.
  // El prop "fitView" solo encuadra la vista en el montaje inicial (sin nodos
  // todavia); como estos llegan despues via fetch, hay que volver a llamar
  // fitView imperativamente una vez que los nodos reales ya estan en el DOM.
  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    if (layoutedNodes.length > 0) {
      requestAnimationFrame(() => reactFlowInstance.current?.fitView());
    }
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setSelectedCourse(null);
  };

  // Derivado de los nodos ya mostrados (obligatorios + resumenes de
  // electivas), no de la lista cruda de cursos - asi el conteo coincide con
  // lo que el alumno realmente ve dibujado en la malla.
  const progressStats = useMemo(() => {
    const total = nodes.length;
    const approved = nodes.filter((n) => n.data.status === 'approved').length;
    const inProgress = nodes.filter((n) => n.data.status === 'in_progress').length;
    const available = nodes.filter((n) => n.data.status === 'available').length;
    const locked = total - approved - inProgress - available;

    return { total, approved, inProgress, available, locked };
  }, [nodes]);

  return (
    <div className="relative h-screen w-screen bg-bg text-ink">
      {/* Mensaje de error */}
      {error && (
        <div className="absolute left-1/2 top-5 z-[1000] flex -translate-x-1/2 items-center gap-3 rounded-lg border border-bad bg-bad px-6 py-4 text-white shadow-lg">
          <span>⚠️ {error}</span>
          <button
            onClick={loadInitialData}
            className="rounded-md bg-white/20 px-3 py-1 text-xs hover:bg-white/30"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="absolute left-1/2 top-1/2 z-[1000] -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-line border-t-accent" />
          <p className="text-base text-muted">Cargando malla curricular...</p>
        </div>
      )}

      {!loading && curriculumData && (
        <header className="absolute inset-x-0 top-0 z-10 border-b border-line bg-surface/95 px-6 py-6 backdrop-blur-lg">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="m-0 font-display text-3xl font-bold tracking-tight">Malla Curricular</h1>
              <p className="mt-1 text-sm text-muted">Ingeniería de las Telecomunicaciones</p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="rounded-lg border border-warn/30 bg-warn/15 px-4 py-2">
                <div className="text-xs font-semibold text-warn">SEMESTRE ACTUAL</div>
                <div className="text-base font-bold text-warn">{currentSemester}</div>
              </div>

              <div className="rounded-lg border border-good/30 bg-good/15 px-4 py-2">
                <div className="text-xs font-semibold text-good">PROGRESO</div>
                <div className="text-base font-bold text-good">
                  {progressStats.approved}/{progressStats.total} ({progressStats.total ? Math.round((progressStats.approved / progressStats.total) * 100) : 0}%)
                </div>
              </div>
            </div>
          </div>

          {/* Leyenda */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2 rounded-full bg-surface-2 px-3 py-1.5 font-medium text-ink">
              <span className="h-3 w-3 rounded-full border border-line" style={{ background: 'var(--t-accent)' }} />
              Aprobado: color pleno ({progressStats.approved})
            </div>
            <div className="flex items-center gap-2 rounded-full bg-surface-2 px-3 py-1.5 font-medium text-ink">
              <span className="h-3 w-3 rounded-full border border-line" style={{ background: 'var(--t-accent)', opacity: 0.25 }} />
              Pendiente: color atenuado ({progressStats.available + progressStats.locked})
            </div>
            <div className="flex items-center gap-2 rounded-full bg-surface-2 px-3 py-1.5 font-medium text-ink">
              <span className="h-3 w-3 rounded-full ring-2 ring-warn" style={{ background: 'var(--t-accent)', opacity: 0.25 }} />
              En curso ({progressStats.inProgress})
            </div>
            <div className="flex items-center gap-2 rounded-full bg-surface-2 px-3 py-1.5 font-medium text-ink">
              <span className="h-3 w-3 rounded-full border border-dashed border-line" style={{ background: 'var(--t-accent)', opacity: 0.25 }} />
              Resumen de electivos
            </div>
            <p className="text-[11px] text-muted">El color de cada nodo es el de su subcategoría/track, no su estado.</p>

            <div className="mx-2 h-5 w-px bg-line" />

            <div className="flex items-center gap-1.5 rounded-full bg-good/10 px-3 py-1.5">
              <span className="h-0.5 w-4 bg-good" />
              <span className="text-[11px] font-medium text-good">Aprobado (≥11)</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-warn/10 px-3 py-1.5">
              <span className="h-0.5 w-4 bg-warn" />
              <span className="text-[11px] font-medium text-warn">Nota mínima</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5">
              <span
                className="h-0.5 w-4"
                style={{ backgroundImage: 'repeating-linear-gradient(90deg, var(--t-accent) 0, var(--t-accent) 4px, transparent 4px, transparent 8px)' }}
              />
              <span className="text-[11px] font-medium text-accent">Correquisito</span>
            </div>
          </div>
        </header>
      )}

      {/* ReactFlow Container */}
      <div className="h-full w-full pt-40">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={(instance) => { reactFlowInstance.current = instance; }}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.05}
            maxZoom={1.5}
            defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
            style={{ background: 'var(--t-bg)' }}
          >
            <Background color="var(--t-line)" gap={32} size={1} variant="dots" style={{ opacity: 0.6 }} />
            <Controls
              style={{
                background: 'var(--t-surface)',
                border: '1px solid var(--t-line)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
              }}
              showInteractive={false}
            />
            <MiniMap
              nodeColor={(node) => node.data.color || 'var(--t-muted)'}
              style={{
                background: 'var(--t-surface)',
                border: '1px solid var(--t-line)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
              }}
              pannable
              zoomable
            />
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      {/* Panel de Detalles */}
      <CourseDetailPanel
        course={selectedCourse}
        onClose={handleClosePanel}
        isOpen={isPanelOpen}
        courseGrades={courseGrades}
        curriculumData={curriculumData}
      />
    </div>
  );
}

export default CurriculumView;
