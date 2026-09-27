import { useLang } from '../i18n';
import portrait from '../assets/couple-portrait.jpg';
import { FleuronRow } from './Ornaments';
import { Reveal } from './Reveal';
import { TornDivider } from './TornDivider';

/**
 * "لحظاتنا" / "Our Moments" — a romantic gallery section with
 * the couple's photo displayed in an elegant arch frame.
 */
export function OurMoments() {
  const { t } = useLang();
  const m = t.moments;

  return (
    <section className="section our-moments lang-fade" aria-label={m.aria}>
      <TornDivider variant={3} />
      <Reveal>
        <p className="section-kicker">{m.kicker}</p>
        <h2 className="section-title">
          <span className="foil-light">{m.title}</span>
        </h2>
        <p className="section-subtitle">{m.subtitle}</p>
      </Reveal>

      <Reveal delay={150}>
        <div className="moments-frame">
          <div className="moments-frame__gilded">
            <div className="moments-frame__window">
              <img
                className="moments-frame__photo"
                src={portrait}
                alt={m.photoAlt}
                draggable={false}
              />
              <span className="moments-frame__glow" aria-hidden="true" />
            </div>
            <span className="moments-frame__hairline" aria-hidden="true" />
          </div>
          <p className="moments-frame__caption">{m.caption}</p>
        </div>
      </Reveal>

      <Reveal delay={250}>
        <FleuronRow center="heart" className="fleuron-row" />
      </Reveal>
    </section>
  );
}
