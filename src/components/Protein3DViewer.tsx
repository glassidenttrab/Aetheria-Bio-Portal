import React, { useEffect, useRef } from 'react';
import * as $3Dmol from '3dmol';

interface Protein3DViewerProps {
  pdbId?: string;
  uniprotId?: string;
  height?: string;
}

export const Protein3DViewer: React.FC<Protein3DViewerProps> = ({
  pdbId = '1I1E',
  uniprotId = 'P10636',
  height = '320px'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous viewer instance
    containerRef.current.innerHTML = '';

    const element = containerRef.current;
    const config = { backgroundColor: '#0b1326' };
    const viewer = $3Dmol.createViewer(element, config);

    // Fetch sample PDB structure for 3D visualization
    const targetPdb = pdbId || '1I1E';
    $3Dmol.download(`pdb:${targetPdb}`, viewer, { multimodel: true, frames: true }, () => {
      viewer.setStyle({}, { cartoon: { color: 'spectrum' } });
      viewer.addSurface($3Dmol.SurfaceType.VDW, { opacity: 0.4, color: 'cyan' });
      viewer.zoomTo();
      viewer.render();
      viewer.animate({ loop: 'backAndForth', step: 0.5 });
    });

    return () => {
      viewer.clear();
    };
  }, [pdbId, uniprotId]);

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(76, 215, 246, 0.4)' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <div style={{ position: 'absolute', bottom: '12px', left: '16px', background: 'rgba(11, 19, 38, 0.85)', padding: '4px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.75rem', fontWeight: 800, color: '#4cd7f6', backdropFilter: 'blur(10px)' }}>
        3D Interactive AlphaFold / PDB Pocket (Click & Drag to Rotate)
      </div>
    </div>
  );
};
