import React from 'react';
import { Handle, Position } from '@xyflow/react';

const STATUS_STYLES = {
  approved: 'bg-good border-good text-ink-on-accent',
  available: 'bg-accent border-accent text-ink-on-accent',
  in_progress: 'bg-warn border-warn text-ink-on-accent',
  locked: 'bg-surface-2 border-line text-muted',
};

const CourseNode = React.memo(({ data }) => {
  const statusClass = STATUS_STYLES[data.status] || STATUS_STYLES.locked;

  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Left}
        className="!-left-[9px] !h-3 !w-3 !rounded-full !border-2 !border-bg !bg-accent"
      />
      <div
        onClick={() => data.onClick && data.onClick(data)}
        className={`flex h-[140px] w-[140px] cursor-pointer select-none flex-col items-center justify-center rounded-full border-[3px] p-3 text-center shadow-lg transition-transform hover:scale-105 ${statusClass}`}
      >
        <div className="mb-1 text-[13px] font-bold leading-tight">{data.label}</div>
        <div className="mb-0.5 text-[11px] opacity-90">{data.credits} créditos</div>
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
