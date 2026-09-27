import { useRef, type CSSProperties, type KeyboardEvent } from 'react';
import type { Geo } from '../lib/geometry';
import { useLang } from '../i18n';
import { Flourish } from './Ornaments';
import { WaxSeal } from './WaxSeal';
import oliveEnvelope from '../assets/olive-envelope.jpg';
import envelopeBack from '../assets/envelope-back.jpg';
import leftFlapImg from '../assets/envelope-left-flap.png';
import rightFlapImg from '../assets/envelope-right-flap.png';

export type Stage = 'sealed' | 'opening' | 'fading' | 'done';

interface SceneProps {
  stage: Stage;
  geo: Geo;
  ready: boolean;
  onOpen: () => void;
}

export function EnvelopeScene({ stage, geo, ready, onOpen }: SceneProps) {
  const { t } = useLang();
  const envRef = useRef<HTMLDivElement>(null);
  const { W, H, seal, sealTop, ctaTop, drop } = geo;

  const vars = {
    '--w': `${W}px`,
    '--h': `${H}px`,
    '--seal': `${seal}px`,
    '--seal-top': `${sealTop}px`,
    '--cta-top': `${ctaTop}px`,
    '--shift': '0px',
    '--drop': `${drop}px`,
  } as CSSProperties;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen();
    }
  };

  return (
    <div className={`scene stage-${stage}${ready ? ' is-ready' : ''}`} style={vars} dir="ltr">
      <div className="env-float">
        <div className="env-shift">
          <div
            ref={envRef}
            className="envelope"
            role="button"
            tabIndex={stage === 'sealed' ? 0 : -1}
            aria-label={t.openAria}
            aria-disabled={stage !== 'sealed'}
            onClick={onOpen}
            onKeyDown={onKeyDown}
          >
            {/* Ambient drop shadow */}
            <div className="env-shadow" />

            {/* Envelope Back / Interior Lining */}
            <div className="env-back">
              <img src={envelopeBack} alt="" className="env-back__img" draggable={false} />
            </div>

            {/* Pristine closed envelope front (visible when sealed for 100% seamless photo look) */}
            <div className="env-front-sealed" aria-hidden="true">
              <img src={oliveEnvelope} alt="" className="env-front__img" draggable={false} />
            </div>

            {/* LEFT FLAP */}
            <div className="env-gate-flap env-gate-flap--left" aria-hidden="true">
              <div className="env-gate-flap__face env-gate-flap__face--front">
                <img src={leftFlapImg} alt="" className="env-flap-art" draggable={false} />
              </div>
            </div>

            {/* RIGHT FLAP (with white wax seal affixed) */}
            <div className="env-gate-flap env-gate-flap--right" aria-hidden="true">
              <div className="env-gate-flap__face env-gate-flap__face--front">
                <img src={rightFlapImg} alt="" className="env-flap-art" draggable={false} />
              </div>

              {/* White wax seal mounted directly ON the right flap tab */}
              <div className="flap-seal">
                <div className="seal-inner">
                  <WaxSeal />
                </div>
              </div>
            </div>

            {/* CTA Prompt ("اضغط لفتح الدعوة") */}
            <div className="env-cta" aria-hidden="true">
              <span className="env-cta__fade lang-fade">
                <span className="env-cta__text">{t.cta}</span>
              </span>
              <Flourish className="env-cta__flourish" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
