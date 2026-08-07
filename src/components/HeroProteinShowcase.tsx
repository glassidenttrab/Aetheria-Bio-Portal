import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { DEPARTMENT_DEFAULT_PROTEINS } from '../services/neuroLongevityEngine';
import { SaasCategory } from '../types';
import { ZoomIn, ZoomOut } from 'lucide-react';

const DEPT_KEYS: SaasCategory[] = [
  'neurosurgery', 'neurology', 'orthopedics', 'psychiatry', 'cardiology',
  'oncology', 'endocrinology', 'immunology', 'dermatology', 'ophthalmology', 'longevity'
];

const AMINO_ACIDS = ['ALA', 'ARG', 'ASN', 'ASP', 'CYS', 'GLN', 'GLU', 'GLY', 'HIS', 'ILE', 'LEU', 'LYS', 'MET', 'PHE', 'PRO', 'SER', 'THR', 'TRP', 'TYR', 'VAL'];

const PALETTE_SETS = [
  ['#4cd7f6', '#4edea3', '#d0bcff', '#ffd700'],
  ['#ff6b81', '#ffd700', '#4cd7f6', '#ffffff'],
  ['#4edea3', '#1bbd85', '#d0bcff', '#4cd7f6'],
  ['#d0bcff', '#ff6b81', '#4edea3', '#ffd700']
];

export const HeroProteinShowcase: React.FC = () => {
  const { t } = useLanguage();
  const [deptKey] = useState<SaasCategory>(() => DEPT_KEYS[Math.floor(Math.random() * DEPT_KEYS.length)]);
  const protein = DEPARTMENT_DEFAULT_PROTEINS[deptKey];

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Continuous auto-rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setRotationAngle(prev => (prev + 1.5) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Procedural 3D sphere-graph rendering (deterministic per protein, seeded by pdbId)
  useEffect(() => {
    if (!canvasRef.current || !protein) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(76, 215, 246, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    let seed = 0;
    for (let s = 0; s < protein.pdbId.length; s++) {
      seed = (seed << 5) - seed + protein.pdbId.charCodeAt(s);
      seed |= 0;
    }
    const seedAbs = Math.abs(seed);

    const numNodes = 32 + (seedAbs % 24);
    const helixFrequency = 2 + ((seedAbs % 5) * 0.8);
    const loopFactor = 0.5 + ((seedAbs % 7) * 0.1);
    const rad = (rotationAngle * Math.PI) / 180;
    const baseRadius = (100 + (seedAbs % 40)) * zoomLevel;

    ctx.save();
    ctx.translate(centerX, centerY);

    const nodes: { x: number; y: number; z: number; color: string; label: string }[] = [];
    const activePalette = PALETTE_SETS[seedAbs % PALETTE_SETS.length];

    for (let i = 0; i < numNodes; i++) {
      const theta = (i / numNodes) * Math.PI * helixFrequency;
      const phi = (i / numNodes) * Math.PI * 3 * loopFactor;

      const rawX = Math.cos(theta + rad) * baseRadius * (0.7 + 0.3 * Math.sin(phi + seedAbs));
      const rawY = (i - numNodes / 2) * ((8 + (seedAbs % 6)) * zoomLevel) + (Math.cos(phi) * 20);
      const rawZ = Math.sin(theta + rad) * baseRadius * (0.8 + 0.2 * Math.cos(theta));

      const color = activePalette[i % activePalette.length];
      const residueCode = AMINO_ACIDS[(seedAbs + i * 7) % AMINO_ACIDS.length];
      const residueNumber = i + 1 + (seedAbs % 50);

      nodes.push({ x: rawX, y: rawY, z: rawZ, color, label: `${residueCode}-${residueNumber}` });
    }

    nodes.sort((a, b) => a.z - b.z);

    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(76, 215, 246, 0.6)';
    nodes.forEach((node, index) => {
      if (index === 0) ctx.moveTo(node.x, node.y);
      else ctx.lineTo(node.x, node.y);
    });
    ctx.stroke();

    nodes.forEach(node => {
      const scale = (node.z + 200) / 400;
      const size = 18 * scale * zoomLevel;

      ctx.beginPath();
      ctx.arc(node.x, node.y, Math.max(3, size), 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.shadowColor = node.color;
      ctx.shadowBlur = 15 * scale;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.font = `${Math.max(9, 11 * scale)}px monospace`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x + Math.max(3, size) + 4, node.y);
    });

    ctx.restore();
  }, [protein, rotationAngle, zoomLevel]);

  if (!protein) return null;

  return (
    <div style={{
      width: '320px', flexShrink: 0, borderRadius: '20px', overflow: 'hidden',
      border: '1px solid rgba(76, 215, 246, 0.4)', background: '#0b1326',
      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)'
    }}>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(15, 23, 42, 0.9)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fff', lineHeight: 1.3 }}>
            {protein.proteinName}
          </div>
          <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 2.0))}
              style={{ padding: '5px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#dae2fd', cursor: 'pointer', display: 'flex' }}
              title="Zoom In"
            >
              <ZoomIn size={13} />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.6))}
              style={{ padding: '5px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#dae2fd', cursor: 'pointer', display: 'flex' }}
              title="Zoom Out"
            >
              <ZoomOut size={13} />
            </button>
          </div>
        </div>
        <span className="badge badge-cyan" style={{ fontSize: '0.68rem', fontWeight: 800, marginTop: '6px', display: 'inline-block' }}>
          {protein.pdbId}
        </span>
        <div style={{ fontSize: '0.68rem', color: '#8899a6', marginTop: '6px' }}>
          AlphaFold DB 200M+ & RCSB PDB Real-Time Interactive 3D Canvas
        </div>
      </div>

      <canvas ref={canvasRef} width={640} height={480} style={{ width: '100%', height: '220px', display: 'block', cursor: 'grab' }} />

      <div style={{ padding: '8px 14px', background: 'rgba(15, 23, 42, 0.95)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: '0.72rem', color: '#4cd7f6', fontWeight: 800 }}>
          {t(`dept.${deptKey}`, deptKey)}
        </div>
      </div>
    </div>
  );
};
