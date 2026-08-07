import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { checkPrerequisites, getCourseStatus } from '../../../utils/prerequisiteUtils.js';
import CourseNode from './CourseNode.jsx';
import CourseDetailPanel from './CourseDetailPanel.jsx';
import { StudentApi } from '../../../services/student/studentApi.js';
import { CurriculumApi } from '../../../services/student/curriculumApi.js';

const nodeTypes = {
  courseNode: CourseNode
};

const LEGEND_ITEMS = [
  { key: 'approved', label: 'Aprobado', dotClass: 'bg-good', pillClass: 'bg-good/15 text-good' },
  { key: 'inProgress', label: 'En progreso', dotClass: 'bg-warn', pillClass: 'bg-warn/15 text-warn' },
  { key: 'available', label: 'Disponible', dotClass: 'bg-accent', pillClass: 'bg-accent/15 text-accent' },
  { key: 'locked', label: 'Bloqueado', dotClass: 'bg-muted', pillClass: 'bg-muted/15 text-muted' },
];

function CurriculumView() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [curriculumData, setCurriculumData] = useState(null);
  const [studentData, setStudentData] = useState({
    courseGrades: {},
    currentCourses: [],
    currentSemester: '',
    studentInfo: null
  });

  const courseGrades = studentData.courseGrades;
  const currentCourses = studentData.currentCourses;
  const currentSemester = studentData.currentSemester;
  // Object.keys() siempre da strings; los ids de curso son numeros en el
  // resto de la app (vienen de la API asi), por eso se convierten aca -
  // si no, el .includes(node.id) de mas abajo nunca haria match.
  const approvedCourses = useMemo(() =>
    Object.keys(courseGrades).filter(courseId => courseGrades[courseId] >= 11).map(Number),
    [courseGrades]
  );
  // currentCourses llega como objetos {id, code, name, ...} desde el backend,
  // no como una lista plana de ids.
  const currentCourseIds = useMemo(() =>
    new Set((studentData.currentCourses || []).map(c => c.id)),
    [studentData.currentCourses]
  );

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [curriculum, academic] = await Promise.all([
        CurriculumApi.getCurriculum(),
        StudentApi.getAcademicInfo()
      ]);

      setCurriculumData(curriculum);
      setStudentData({
        courseGrades: academic.courseGrades || {},
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

    const nodes = curriculumData.nodes.map((node) => {
      const isApproved = approvedCourses.includes(node.id);
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

      const nodesInCycle = curriculumData.nodes.filter(n => n.cycle === node.cycle);
      const nodeIndexInCycle = nodesInCycle.indexOf(node);

      return {
        id: node.id,
        type: 'courseNode',
        position: {
          x: node.cycle * 300,
          y: nodeIndexInCycle * 180 + 50
        },
        data: {
          label: node.name,
          credits: node.credits,
          cycle: node.cycle,
          status: status,
          id: node.id,
          onClick: (data) => {
            setSelectedCourse(data);
            setIsPanelOpen(true);
          }
        },
      };
    });

    const edges = curriculumData.edges.map(edge => {
      let strokeVar = '--t-accent';
      let strokeDasharray = 'none';

      const PREREQUISITE_TYPES = curriculumData.prerequisiteTypes || {};

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
  }, [curriculumData, approvedCourses, courseGrades, currentCourseIds]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  // useNodesState/useEdgesState solo toman su valor inicial una vez; sin este
  // efecto, el grafo queda vacío la primera vez porque layoutedNodes/Edges
  // se recalculan de forma asincrona (recien cuando termina de cargar
  // curriculumData) y nunca se copian al estado real que consume ReactFlow.
  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setSelectedCourse(null);
  };

  const progressStats = useMemo(() => {
    if (!curriculumData) {
      return { total: 0, approved: 0, inProgress: 0, available: 0, locked: 0 };
    }

    const total = curriculumData.nodes.length;
    const approved = approvedCourses.length;
    const inProgress = currentCourses.length;
    const available = nodes.filter(n => n.data.status === 'available').length;
    const locked = total - approved - inProgress - available;

    return { total, approved, inProgress, available, locked };
  }, [curriculumData, approvedCourses, currentCourses, nodes]);

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
            {LEGEND_ITEMS.map(item => (
              <div key={item.key} className={`flex items-center gap-2 rounded-full px-3 py-1.5 font-medium ${item.pillClass}`}>
                <span className={`h-3 w-3 rounded-full ${item.dotClass}`} />
                {item.label} ({progressStats[item.key]})
              </div>
            ))}

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
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.3}
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
              nodeColor={(node) => {
                if (node.data.status === 'approved') return 'var(--t-good)';
                if (node.data.status === 'in_progress') return 'var(--t-warn)';
                if (node.data.status === 'available') return 'var(--t-accent)';
                return 'var(--t-muted)';
              }}
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
