import { useMemo } from 'react';
import { blobPath, useSafeId } from '../lib/shapes';

/**
 * Hyper-real metallic gold wax seal, built in SVG with lighting filters:
 * a domed, irregular wax pool, a pressed (recessed) stamp well, a beaded ring
 * and the embossed, intertwined monogram "A & A".
 */
export function WaxSeal({ className = '', glint = true }: { className?: string; glint?: boolean }) {
  const uid = useSafeId('seal');
  const id = (s: string) => `${uid}-${s}`;
  const url = (s: string) => `url(#${id(s)})`;
  const outer = useMemo(() => blobPath(100, 100, 91, 18, 11, 0.075), []);

  return (
    <div className={`wax-seal ${className}`}>
      <svg viewBox="0 0 200 200" className="wax-seal__svg" aria-hidden="true">
        <defs>
          <radialGradient id={id('wax')} cx="36%" cy="30%" r="80%">
            <stop offset="0" stopColor="#fff5cf" />
            <stop offset="0.16" stopColor="#f0d283" />
            <stop offset="0.42" stopColor="#c69436" />
            <stop offset="0.7" stopColor="#8a5f18" />
            <stop offset="1" stopColor="#4a3006" />
          </radialGradient>
          <radialGradient id={id('well')} cx="62%" cy="66%" r="78%">
            <stop offset="0" stopColor="#efd083" />
            <stop offset="0.5" stopColor="#bd8f3a" />
            <stop offset="1" stopColor="#7a5415" />
          </radialGradient>
          <linearGradient id={id('rimIn')} x1="0.15" y1="0.1" x2="0.85" y2="0.9">
            <stop offset="0" stopColor="#3b2503" />
            <stop offset="0.55" stopColor="#8f6720" stopOpacity="0.5" />
            <stop offset="1" stopColor="#fff0bd" />
          </linearGradient>
          <linearGradient id={id('rimOut')} x1="0.15" y1="0.1" x2="0.85" y2="0.9">
            <stop offset="0" stopColor="#fff6d6" />
            <stop offset="0.5" stopColor="#d9b061" stopOpacity="0.4" />
            <stop offset="1" stopColor="#4e3307" />
          </linearGradient>
          <linearGradient id={id('glyph')} x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0" stopColor="#fff8dc" />
            <stop offset="0.38" stopColor="#f0cf7e" />
            <stop offset="0.72" stopColor="#bb8c3a" />
            <stop offset="1" stopColor="#7e5719" />
          </linearGradient>

          {/* domed wax body with a soft specular hot-spot */}
          <filter id={id('dome')} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur" />
            <feSpecularLighting in="blur" surfaceScale="7" specularConstant="0.85" specularExponent="18" lightingColor="#fff3d1" result="spec">
              <fePointLight x="48" y="28" z="190" />
            </feSpecularLighting>
            <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn" />
            <feComposite in="SourceGraphic" in2="specIn" operator="arithmetic" k1="0" k2="1" k3="0.7" k4="0" />
          </filter>

          {/* raised, embossed relief for the monogram + ring */}
          <filter id={id('emboss')} x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceAlpha" stdDeviation="0.9" result="b" />
            <feSpecularLighting in="b" surfaceScale="2.4" specularConstant="1" specularExponent="14" lightingColor="#ffffff" result="s">
              <feDistantLight azimuth="225" elevation="42" />
            </feSpecularLighting>
            <feComposite in="s" in2="SourceAlpha" operator="in" result="si" />
            <feOffset in="SourceAlpha" dx="1.1" dy="1.6" result="o" />
            <feGaussianBlur in="o" stdDeviation="0.9" result="ob" />
            <feFlood floodColor="#2a1902" floodOpacity="0.72" />
            <feComposite in2="ob" operator="in" result="sh" />
            <feMerge>
              <feMergeNode in="sh" />
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="si" />
            </feMerge>
          </filter>

          <filter id={id('soft')} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="1" />
          </filter>

          <filter id={id('grain')} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="1.3" numOctaves="2" seed="4" />
            <feColorMatrix type="saturate" values="0" />
          </filter>

          <clipPath id={id('clip')}>
            <path d={outer} />
          </clipPath>
        </defs>

        {/* wax pool */}
        <path d={outer} fill={url('wax')} filter={url('dome')} />
        {/* metallic flake texture */}
        <rect width="200" height="200" filter={url('grain')} clipPath={url('clip')} opacity="0.13" style={{ mixBlendMode: 'overlay' }} />

        {/* pushed-up lip around the stamp */}
        <circle cx="100" cy="100" r="75" fill="none" stroke={url('rimOut')} strokeWidth="3.2" filter={url('soft')} />
        {/* recessed stamp well */}
        <circle cx="100" cy="100" r="71" fill={url('well')} />
        <circle cx="100" cy="100" r="70" fill="none" stroke={url('rimIn')} strokeWidth="4" filter={url('soft')} />

        {/* beaded + engraved rings */}
        <g filter={url('emboss')}>
          <circle cx="100" cy="100" r="61.5" fill="none" stroke={url('glyph')} strokeWidth="2.6" strokeDasharray="0.01 5.35" strokeLinecap="round" />
          <circle cx="100" cy="100" r="55.5" fill="none" stroke={url('glyph')} strokeWidth="0.9" />
        </g>

        {/* intertwined monogram */}
        <g fill={url('glyph')} textAnchor="middle">
          <text x="75" y="120" fontSize="52" fontFamily="'Cinzel Decorative','Cinzel',serif" fontWeight="700" filter={url('emboss')}>
            A
          </text>
          <text x="125" y="120" fontSize="52" fontFamily="'Cinzel Decorative','Cinzel',serif" fontWeight="700" filter={url('emboss')}>
            A
          </text>
          <text
            x="100"
            y="125"
            fontSize="48"
            fontFamily="'Cormorant Garamond',serif"
            fontStyle="italic"
            fontWeight="600"
            stroke="#8a611c"
            strokeWidth="2.6"
            paintOrder="stroke"
            filter={url('emboss')}
          >
            &amp;
          </text>
        </g>
      </svg>
      {glint && <span className="wax-seal__glint" aria-hidden="true" />}
    </div>
  );
}
