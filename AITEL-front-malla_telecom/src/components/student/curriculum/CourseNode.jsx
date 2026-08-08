import React from 'react';
import { Handle, Position } from '@xyflow/react';

function hexToRgba(hex, alpha) {
  if (!hex) {
    return `rgba(148, 163, 184, ${alpha})`;
  }
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const value = parseInt(full, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const CourseNode = React.memo(({ data }) => {
  const color = data.color || '#1979C3';
  const isApproved = data.status === 'approved';
  const isInProgress = data.status === 'in_progress';

  // El color representa la identidad del curso (subcategoria/track), no su
  // estado de avance: aprobado se ve con el color pleno, cualquier otro
  // estado se ve atenuado sobre ese mismo color para no perder la referencia
  // de a que grupo pertenece. "En curso" se distingue con un anillo aparte.
  const backgroundColor = isApproved ? color : hexToRgba(color, 0.16);
  const borderColor = isApproved ? color : hexToRgba(color, 0.45);
  const textColor = isApproved ? '#FFFFFF' : 'var(--t-ink)';

  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Left}
        className="!-left-[9px] !h-3 !w-3 !rounded-full !border-2 !border-bg !bg-accent"
      />
      <div
        onClick={() => data.onClick && data.onClick(data)}
        className={`flex h-[140px] w-[140px] select-none flex-col items-center justify-center rounded-full border-[3px] p-3 text-center shadow-lg transition-transform ${data.onClick ? 'cursor-pointer hover:scale-105' : 'cursor-default'} ${data.isPlaceholder ? 'border-dashed' : ''} ${isInProgress ? 'ring-4 ring-warn ring-offset-2 ring-offset-bg' : ''}`}
        style={{ backgroundColor, borderColor, color: textColor }}
      >
        <div className="mb-1 text-[13px] font-bold leading-tight">{data.label}</div>
        {data.credits != null && (
          <div className="mb-0.5 text-[11px] opacity-90">{data.credits} créditos</div>
        )}
        <div className="text-[10px] opacity-80">Ciclo {data.cycle}</div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!-right-[9px] !h-3 !w-3 !rounded-full !border-2 !border-bg !bg-accent"
      />
    </div>
  );
});

export default CourseNode;
