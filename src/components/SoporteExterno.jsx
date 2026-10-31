import { servicios } from '../data/servicios'
import { IconBadge } from './Icon'
import Reveal from './Reveal'

function scrollToService(id) {
  document.getElementById(`servicio-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function ProviderCard({ provider }) {
  return (
    <div className="card provider-card">
      <div className="provider-head">
        <span className="provider-initial">{provider.name[0]}</span>
        <h3>{provider.name}</h3>
      </div>
      <dl className="provider-facts">
        <dt>¿Qué es?</dt>
        <dd>{provider.que}</dd>
        <dt>¿Para qué lo usamos?</dt>
        <dd>{provider.paraQue}</dd>
        <dt>¿Cómo funciona?</dt>
        <dd>{provider.como}</dd>
      </dl>
      <a href={provider.url} target="_blank" rel="noopener noreferrer" className="view-cargo-link provider-link">
        Sitio oficial ↗
      </a>
    </div>
  )
}

export default function SoporteExterno() {
  return (
    <>
      <section className="hero hero-sm">
        <h1>Soporte Externo</h1>
      </section>

      <section className="section">
        <Reveal>
          <div className="card panel">
            <h2>Servicios de terceros</h2>
            <p>
              Además del equipo interno, el Área de Software depende de proveedores externos para la conectividad, la
              nube, la seguridad, los pagos y la atención a los centros médicos. Estos son los servicios que
              contratamos, qué necesidad cubre cada uno y cómo funcionan.
            </p>
            <div className="chip-row service-chips">
              {servicios.map((s) => (
                <button key={s.id} type="button" className="chip" onClick={() => scrollToService(s.id)}>
                  {s.title}
                </button>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {servicios.map((s, i) => (
        <div key={s.id} id={`servicio-${s.id}`} className="service-block">
          <section className={`band ${i % 2 === 0 ? 'teal' : 'dark'} divider`}>
            <Reveal className="service-band">
              <IconBadge name={s.icon} tone="light" size={52} />
              <div>
                <h2 className="band-title">{s.title}</h2>
                <p className="light small service-need">{s.need}</p>
              </div>
            </Reveal>
          </section>

          <section className="section">
            <div className={`grid ${s.providers.length >= 3 ? 'grid-3' : s.providers.length === 2 ? 'grid-2' : 'service-single'}`}>
              {s.providers.map((p, j) => (
                <Reveal key={p.name} delay={j * 80}>
                  <ProviderCard provider={p} />
                </Reveal>
              ))}
              {s.video && s.providers.length === 1 && (
                <Reveal delay={120}>
                  <div className="card video-card">
                    <h3>{s.video.title}</h3>
                    <div className="video-frame">
                      <iframe
                        src={`https://www.youtube.com/embed/${s.video.id}`}
                        title={s.video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                  </div>
                </Reveal>
              )}
            </div>

            {s.video && s.providers.length > 1 && (
              <Reveal className="service-video-row">
                <div className="card video-card">
                  <h3>{s.video.title}</h3>
                  <div className="video-frame">
                    <iframe
                      src={`https://www.youtube.com/embed/${s.video.id}`}
                      title={s.video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                </div>
              </Reveal>
            )}
          </section>
        </div>
      ))}
    </>
  )
}
