import React from 'react';

const Corners = ({ size = 14, color = '#C9A15A', thickness = 1.5, className = '' }) => {
  const isClass = typeof color === 'string' && color.startsWith('border-');

  if (isClass) {
    return (
      <div className={`absolute inset-0 pointer-events-none ${className}`}>
        <span className={`absolute top-0 left-0 w-2.5 h-2.5 border-t border-l ${color}`} />
        <span className={`absolute top-0 right-0 w-2.5 h-2.5 border-t border-r ${color}`} />
        <span className={`absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l ${color}`} />
        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r ${color}`} />
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <span style={{ position: 'absolute', top: 0, left: 0, width: size, height: size, borderTop: `${thickness}px solid ${color}`, borderLeft: `${thickness}px solid ${color}` }} />
      <span style={{ position: 'absolute', top: 0, right: 0, width: size, height: size, borderTop: `${thickness}px solid ${color}`, borderRight: `${thickness}px solid ${color}` }} />
      <span style={{ position: 'absolute', bottom: 0, left: 0, width: size, height: size, borderBottom: `${thickness}px solid ${color}`, borderLeft: `${thickness}px solid ${color}` }} />
      <span style={{ position: 'absolute', bottom: 0, right: 0, width: size, height: size, borderBottom: `${thickness}px solid ${color}`, borderRight: `${thickness}px solid ${color}` }} />
    </div>
  );
};

export default Corners;
