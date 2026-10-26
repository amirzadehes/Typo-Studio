import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Vazirmatn';

const {fontFamily} = loadFont('normal', {weights: ['500', '800'], subsets: ['arabic', 'latin']});

// [Hintergrund, Hauptfarbe, Akzent für *markierte* Wörter]
const PAL = [
  ['#0f172a', '#7c3aed', '#facc15'],
  ['#1e1b4b', '#ec4899', '#67e8f9'],
  ['#052e2b', '#10b981', '#fde047'],
  ['#1c1917', '#f97316', '#fef08a'],
];
const SIZE = {title: 130, keyword: 120, number: 240, quote: 96};

// Wörter einzeln animieren (nie Buchstabe für Buchstabe, sonst brechen die persischen Verbindungen)
const parse = (text) => {
  let on = false;
  return (text || '').split(/\s+/).filter(Boolean).map((t) => {
    if (t.startsWith('*')) on = true;
    const hl = on;
    if (t.endsWith('*')) on = false;
    return {w: t.replace(/\*/g, ''), hl};
  }).filter((x) => x.w);
};

const Scene = ({scene, pal, dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words = parse(scene.text);
  const n = words.length || 1;
  const stagger = Math.max(1, Math.min(6, Math.floor((dur * 0.4) / n)));
  const size = (SIZE[scene.style] || 120) * (n > 10 ? 0.62 : n > 6 ? 0.78 : 1);
  const out = interpolate(f, [dur - 8, dur], [1, 0], {extrapolateLeft: 'clamp'});
  const bar = spring({frame: f - 4, fps, config: {damping: 200}});
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: out, padding: 80}}>
      {scene.style === 'quote' && (
        <div style={{fontFamily, fontSize: 300, height: 140, color: pal[1], lineHeight: 1}}>”</div>
      )}
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', direction: 'rtl', gap: `0 ${size * 0.3}px`,
        fontFamily, fontWeight: 800, fontSize: size, lineHeight: 1.55, textAlign: 'center', color: '#fff'}}>
        {words.map((w, i) => {
          const s = spring({frame: f - i * stagger, fps, config: {damping: 12, stiffness: 140}});
          return (
            <span key={i} style={{display: 'inline-block', opacity: Math.min(1, s * 1.5),
              transform: `translateY(${(1 - s) * 60}px) scale(${0.7 + 0.3 * s})`,
              color: w.hl ? pal[2] : '#fff', textShadow: w.hl ? `0 0 40px ${pal[1]}` : 'none'}}>
              {w.w}
            </span>
          );
        })}
      </div>
      <div style={{marginTop: 60, height: 12, width: 420 * bar, borderRadius: 6, background: pal[2]}} />
    </AbsoluteFill>
  );
};

export const Typo = ({scenes = []}) => {
  const f = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = f / fps;
  let idx = 0;
  scenes.forEach((s, i) => { if (s.start <= t) idx = i; });
  const pal = PAL[idx % PAL.length];
  return (
    <AbsoluteFill style={{backgroundColor: pal[0], background: `linear-gradient(${160 + Math.sin(f / 60) * 25}deg, ${pal[0]} 30%, ${pal[1]}66)`}}>
      <Audio src={staticFile('audio.mp3')} />
      <div style={{position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: pal[1], opacity: 0.25,
        filter: 'blur(90px)', left: 100 + Math.sin(f / 50) * 160, top: 300 + Math.cos(f / 70) * 220}} />
      {scenes.map((s, i) => (
        <Sequence key={i} from={Math.round(s.start * fps)} durationInFrames={Math.max(12, Math.round((s.end - s.start) * fps))}>
          <Scene scene={s} pal={PAL[i % PAL.length]} dur={Math.max(12, Math.round((s.end - s.start) * fps))} />
        </Sequence>
      ))}
      <div style={{position: 'absolute', top: 0, right: 0, height: 10, width: `${(f / durationInFrames) * 100}%`, background: pal[2]}} />
    </AbsoluteFill>
  );
};
