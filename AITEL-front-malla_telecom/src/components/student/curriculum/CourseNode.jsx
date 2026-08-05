import React from 'react';
import { Handle, Position } from 'reactflow';

const CourseNode = React.memo(({ data }) => {
  const getNodeStyles = (status) => {
    const baseStyle = {
      width: '140px',
      height: '140px',
      borderRadius: '50%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 255, 255, 0.1)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      border: '3px solid',
      userSelect: 'none',
      fontSize: '14px',
      fontWeight: 'bold',
      backdropFilter: 'blur(10px)'
    };
    
    switch (status) {
      case 'approved':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderColor: '#34d399',
          color: 'white',
          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4), 0 0 20px rgba(52, 211, 153, 0.3)'
        };
      case 'available':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
          borderColor: '#22d3ee',
          color: 'white',
          boxShadow: '0 8px 32px rgba(6, 182, 212, 0.4), 0 0 20px rgba(34, 211, 238, 0.3)'
        };
      case 'in_progress':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          borderColor: '#fbbf24',
          color: 'white',
          boxShadow: '0 8px 32px rgba(245, 158, 11, 0.4), 0 0 20px rgba(251, 191, 36, 0.3)'
        };
      case 'locked':
      default:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
          borderColor: '#64748b',
          color: '#cbd5e1',
          cursor: 'pointer',
          opacity: 0.8,
          boxShadow: '0 8px 32px rgba(71, 85, 105, 0.3), 0 0 20px rgba(100, 116, 139, 0.2)'
        };
    }
  };

  const handleMouseEvents = {
    onMouseEnter: (e) => {
      e.currentTarget.style.transform = 'scale(1.05)';
      e.currentTarget.style.filter = 'brightness(1.1)';
    },
    onMouseLeave: (e) => {
      e.currentTarget.style.transform = 'scale(1)';
      e.currentTarget.style.filter = 'brightness(1)';
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <Handle 
        type="target" 
        position={Position.Left} 
        style={{ 
          background: 'linear-gradient(135deg, #14b8a6, #0d9488)', 
          width: '12px', 
          height: '12px', 
          border: '2px solid #1f2937',
          left: '-9px',
          borderRadius: '50%',
          boxShadow: '0 0 10px rgba(20, 184, 166, 0.5)'
        }} 
      />
      <div
        style={getNodeStyles(data.status)}
        onClick={() => data.onClick && data.onClick(data)}
        {...handleMouseEvents}
      >
        <div style={{ 
          fontSize: '13px', 
          fontWeight: 'bold', 
          lineHeight: '1.2', 
          marginBottom: '4px',
          textAlign: 'center',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
        }}>
          {data.label}
        </div>
        <div style={{ 
          fontSize: '11px', 
          opacity: 0.9,
          marginBottom: '2px',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
        }}>
          {data.credits} créditos
        </div>
        <div style={{ 
          fontSize: '10px', 
          opacity: 0.8,
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
        }}>
          Ciclo {data.cycle}
        </div>
      </div>
      <Handle 
        type="source" 
        position={Position.Right} 
        style={{ 
          background: 'linear-gradient(135deg, #f97316, #ea580c)', 
          width: '12px', 
          height: '12px', 
          border: '2px solid #1f2937',
          right: '-9px',
          borderRadius: '50%',
          boxShadow: '0 0 10px rgba(249, 115, 22, 0.5)'
        }} 
      />
    </div>
  );
});

export default CourseNode;