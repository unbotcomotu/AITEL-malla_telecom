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

// Simulando imports de los módulos (en tu proyecto real serían imports reales)
import { checkPrerequisites, getCourseStatus } from '../../../utils/prerequisiteUtils.js';
import CourseNode from './CourseNode.jsx';
import CourseDetailPanel from './CourseDetailPanel.jsx';
import { StudentApi } from '../../../services/student/studentApi.js';
import { CurriculumApi } from '../../../services/student/curriculumApi.js';
const nodeTypes = { 
  courseNode: CourseNode 
};

// Componente Principal de la Aplicación
function CurriculumView() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
    // NUEVOS ESTADOS
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [curriculumData, setCurriculumData] = useState(null);
  const [studentData, setStudentData] = useState({
    courseGrades: {},
    currentCourses: [],
    currentSemester: '',
    studentInfo: null
  });
  
  // Estados derivados para compatibilidad
  const courseGrades = studentData.courseGrades;
  const currentCourses = studentData.currentCourses;
  const currentSemester = studentData.currentSemester;
  const approvedCourses = useMemo(() => 
    Object.keys(courseGrades).filter(courseId => courseGrades[courseId] >= 11),
    [courseGrades]
  );

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Cargar datos en paralelo
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
    // Si aún no hay datos, retornar vacío
    if (!curriculumData) {
      return { nodes: [], edges: [] };
    }

    const nodes = curriculumData.nodes.map((node) => {
      const isApproved = approvedCourses.includes(node.id);
      const isInProgress = currentCourses.includes(node.id);
      // Dentro del useMemo donde calculas los nodos:
      const prerequisites = checkPrerequisites(
        node.id, 
        courseGrades,
        curriculumData.edges,           // ← pasar edges
        curriculumData.nodes,           // ← pasar nodes
        curriculumData.prerequisiteTypes // ← pasar types
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
      let strokeColor = '#06b6d4';
      let strokeDasharray = 'none';
      
      const PREREQUISITE_TYPES = curriculumData.prerequisiteTypes || {};
      
      switch (edge.type) {
        case PREREQUISITE_TYPES.APPROVED:
          strokeColor = '#10b981';
          break;
        case PREREQUISITE_TYPES.MIN_GRADE:
          strokeColor = '#f59e0b';
          break;
        case PREREQUISITE_TYPES.COREQUISITE:
          strokeColor = '#06b6d4';
          strokeDasharray = '8,4';
          break;
        default:
          strokeColor = '#64748b';
      }
      
      return {
        ...edge,
        type: 'smoothstep',
        markerEnd: { type: 'arrowclosed' },
        style: { 
          stroke: strokeColor, 
          strokeWidth: 2, 
          strokeDasharray: strokeDasharray,
          filter: `drop-shadow(0 0 5px ${strokeColor}80)`
        },
        animated: edge.type === PREREQUISITE_TYPES.COREQUISITE
      };
    });

    return { nodes, edges };
  }, [curriculumData, approvedCourses, courseGrades, currentCourses]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

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
    <div style={{
      width: '100vw',
      height: '100vh',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 75%, #475569 100%)',
      position: 'relative'
    }}>
    {/* Mensaje de error */}
      {error && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          padding: '16px 24px',
          background: 'rgba(239, 68, 68, 0.95)',
          border: '1px solid #ef4444',
          borderRadius: '12px',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}>
          <span>⚠️ {error}</span>
          <button onClick={loadInitialData} style={{
            padding: '4px 12px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '12px'
          }}>
            Reintentar
          </button>
        </div>
      )}
      {/* Loading state */}
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          textAlign: 'center'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(6, 182, 212, 0.3)',
            borderTopColor: '#06b6d4',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#cbd5e1', fontSize: '16px' }}>
            Cargando malla curricular...
          </p>
        </div>
      )}
      {/* Header mejorado */}
    {/* Contenido principal - solo mostrar si no está cargando */}
    {!loading && curriculumData && (
      <>
        {/* Header */}
      <header style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.2)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '16px'
        }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              background: 'linear-gradient(to right, #06b6d4, #3b82f6, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0
            }}>
              🎓 Malla Curricular
            </h1>
            <p style={{ fontSize: '14px', color: '#cbd5e1', margin: '4px 0 0 0' }}>
              Ingeniería de Telecomunicaciones - PUCP
            </p>
          </div>

          {/* Información del semestre actual y progreso */}
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center'
          }}>
            <div style={{
              padding: '8px 16px',
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}>
              <div style={{ color: '#fbbf24', fontSize: '12px', fontWeight: '600' }}>
                📅 SEMESTRE ACTUAL
              </div>
              <div style={{ color: '#fbbf24', fontSize: '16px', fontWeight: '700' }}>
                {currentSemester}
              </div>
            </div>

            <div style={{
              padding: '8px 16px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <div style={{ color: '#10b981', fontSize: '12px', fontWeight: '600' }}>
                📊 PROGRESO
              </div>
              <div style={{ color: '#10b981', fontSize: '16px', fontWeight: '700' }}>
                {progressStats.approved}/{progressStats.total} ({Math.round((progressStats.approved/progressStats.total)*100)}%)
              </div>
            </div>
          </div>
        </div>
        
        {/* Leyenda mejorada con nuevo estado */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '20px', 
          fontSize: '12px' 
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '6px 12px', 
            borderRadius: '20px', 
            background: 'rgba(16, 185, 129, 0.2)' 
          }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #10b981, #059669)' 
            }}></div>
            <span style={{ color: '#34d399', fontWeight: '500' }}>
              Aprobado ({progressStats.approved})
            </span>
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '6px 12px', 
            borderRadius: '20px', 
            background: 'rgba(245, 158, 11, 0.2)' 
          }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #f59e0b, #d97706)' 
            }}></div>
            <span style={{ color: '#fbbf24', fontWeight: '500' }}>
              En Progreso ({progressStats.inProgress})
            </span>
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '6px 12px', 
            borderRadius: '20px', 
            background: 'rgba(6, 182, 212, 0.2)' 
          }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #06b6d4, #0891b2)' 
            }}></div>
            <span style={{ color: '#22d3ee', fontWeight: '500' }}>
              Disponible ({progressStats.available})
            </span>
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '6px 12px', 
            borderRadius: '20px', 
            background: 'rgba(71, 85, 105, 0.2)' 
          }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #475569, #334155)' 
            }}></div>
            <span style={{ color: '#cbd5e1', fontWeight: '500' }}>
              Bloqueado ({progressStats.locked})
            </span>
          </div>
          
          {/* Separador */}
          <div style={{ width: '1px', height: '20px', background: '#64748b', margin: '0 8px' }}></div>
          
          {/* Leyenda de prerrequisitos */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            padding: '6px 12px', 
            borderRadius: '20px', 
            background: 'rgba(16, 185, 129, 0.15)' 
          }}>
            <div style={{ 
              width: '16px', 
              height: '2px', 
              background: '#10b981' 
            }}></div>
            <span style={{ color: '#34d399', fontWeight: '500', fontSize: '11px' }}>Aprobado (≥11)</span>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            padding: '6px 12px', 
            borderRadius: '20px', 
            background: 'rgba(245, 158, 11, 0.15)' 
          }}>
            <div style={{ 
              width: '16px', 
              height: '2px', 
              background: '#f59e0b' 
            }}></div>
            <span style={{ color: '#fbbf24', fontWeight: '500', fontSize: '11px' }}>Nota mínima</span>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            padding: '6px 12px', 
            borderRadius: '20px', 
            background: 'rgba(6, 182, 212, 0.15)' 
          }}>
            <div style={{ 
              width: '16px', 
              height: '2px', 
              background: '#06b6d4',
              backgroundImage: 'repeating-linear-gradient(90deg, #06b6d4 0, #06b6d4 4px, transparent 4px, transparent 8px)'
            }}></div>
            <span style={{ color: '#22d3ee', fontWeight: '500', fontSize: '11px' }}>Correquisito</span>
          </div>
        </div>
      </header>
      </>
    )}
      {/* ReactFlow Container */}
      <div style={{ width: '100%', height: '100%', paddingTop: '160px' }}>
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
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 75%, #475569 100%)'
            }}
          >
            <Background 
              color="rgba(148, 163, 184, 0.3)" 
              gap={32} 
              size={1}
              variant="dots"
              style={{
                opacity: 0.4
              }}
            />
            <Controls 
              style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
              }}
              showInteractive={false}
            />
            <MiniMap 
              nodeColor={(node) => {
                if (node.data.status === 'approved') return '#10b981';
                if (node.data.status === 'in_progress') return '#f59e0b';
                if (node.data.status === 'available') return '#06b6d4';
                return '#475569';
              }}
              style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
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
      />
      {/* Animación CSS */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
    
  );
}

export default CurriculumView;