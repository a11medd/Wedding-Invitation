import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useLang } from '../i18n';
import revealVideo from '../assets/Video - Reveal .mp4';
import { FleuronRow } from './Ornaments';

/**
 * Full-viewport cinematic reveal video that plays above the invitation.
 * The couple's names, date and venue are overlaid on the video,
 * mimicking a "Save The Date" film look.
 */
export function VideoReveal() {
  const { t } = useLang();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;

    // Safety fallback: ensure text content is revealed even before autoplay triggers
    const fallbackTimer = window.setTimeout(() => setPlaying(true), 600);

    const tryPlay = () => {
      v.play()
        .then(() => setPlaying(true))
        .catch(() => undefined);
    };

    tryPlay();

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          tryPlay();
        }
      },
      { threshold: 0.2 },
    );

    if (sectionRef.current) io.observe(sectionRef.current);
    return () => {
      window.clearTimeout(fallbackTimer);
      io.disconnect();
    };
  }, []);

  const scrollToInvite = () => {
    const next = sectionRef.current?.nextElementSibling;
    if (next) {
      next.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={sectionRef}
      className={`video-reveal${playing ? ' is-playing' : ''}`}
      aria-label="Save the Date"
    >
      <video
        ref={videoRef}
        className="video-reveal__media"
        src={revealVideo}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        aria-hidden="true"
        tabIndex={-1}
        onPlaying={() => setPlaying(true)}
      />

      {/* Dark gradient overlays for readability */}
      <span className="video-reveal__shade" aria-hidden="true" />

      {/* Wedding data overlay */}
      <div className="video-reveal__content lang-fade">
        <div className="video-reveal__top">
          <p className="video-reveal__kicker">{t.videoReveal.saveTheDate}</p>
          <FleuronRow center="star" className="video-reveal__ornament" />
        </div>

        <div className="video-reveal__center">
          <p className="video-reveal__date-big">{t.videoReveal.date}</p>
          <div className="video-reveal__divider-wrap" aria-hidden="true">
            <span className="video-reveal__divider-line" />
            <span className="video-reveal__divider-diamond" />
            <span className="video-reveal__divider-line" />
          </div>
          <h2 className="video-reveal__names" aria-label={t.hero.namesAria}>
            <span className="video-reveal__name">{t.hero.groom}</span>
            <span className="video-reveal__amp">{t.hero.amp}</span>
            <span className="video-reveal__name">{t.hero.bride}</span>
          </h2>
        </div>

        <div className="video-reveal__bottom">
          <p className="video-reveal__venue-label">{t.videoReveal.willBe}</p>
          <div className="video-reveal__venue-row">
            <span className="video-reveal__time">{t.venue.time}</span>
            <span className="video-reveal__venue-sep" aria-hidden="true" />
            <span className="video-reveal__venue-name">{t.venue.name}</span>
          </div>
          <FleuronRow center="heart" className="video-reveal__ornament video-reveal__ornament--bottom" />
          <button
            type="button"
            className="video-reveal__scroll-btn"
            onClick={scrollToInvite}
            aria-label={t.videoReveal.scrollDown}
          >
            <svg width="22" height="12" viewBox="0 0 22 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 2L11 10L20 2" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
