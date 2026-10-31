const paths = {
  target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="0.5" fill="currentColor" /></>,
  server: <><rect x="4" y="4" width="16" height="6" rx="1.5" /><rect x="4" y="14" width="16" height="6" rx="1.5" /><circle cx="8" cy="7" r="0.6" fill="currentColor" /><circle cx="8" cy="17" r="0.6" fill="currentColor" /></>,
  cube: <><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" /><path d="M4 7.5L12 12l8-4.5" /><path d="M12 12v9" /></>,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="17" cy="9" r="2.4" /><path d="M15.5 14.2c2.6.4 4.5 2.6 4.5 5.3" /></>,
  chart: <><path d="M4 20h16" /><rect x="6" y="12" width="3" height="6" /><rect x="11" y="8" width="3" height="10" /><rect x="16" y="4" width="3" height="14" /></>,
  shield: <><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" /><path d="M9 12l2 2 4-4" /></>,
  rocket: <><path d="M12 2c3 2 5 6 4 11l-2 2H10l-2-2c-1-5 1-9 4-11z" /><circle cx="12" cy="9" r="1.6" /><path d="M9 15l-2 5 4-2M15 15l2 5-4-2" /></>,
  layers: <><path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 13l9 5 9-5" /><path d="M3 17l9 5 9-5" /></>,
  database: <><ellipse cx="12" cy="5.5" rx="7" ry="2.5" /><path d="M5 5.5v13c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-13" /><path d="M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5" /></>,
  gear: <><circle cx="12" cy="12" r="3.2" /><path d="M12 2.5v3M12 18.5v3M4.6 6.6l2.1 2.1M17.3 15.3l2.1 2.1M2.5 12h3M18.5 12h3M4.6 17.4l2.1-2.1M17.3 8.7l2.1-2.1" /></>,
  compass: <><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" /></>,
  award: <><circle cx="12" cy="8" r="5" /><path d="M9 12.5L7.5 21 12 18.5 16.5 21 15 12.5" /></>,
  leaf: <><path d="M20 4c-9 0-16 5-16 14 9 0 14-5 16-14z" /><path d="M4 20c4-4 8-8 15-15" /></>,
  book: <><path d="M4 5.5C4 4.7 4.7 4 5.5 4H12v16H5.5c-.8 0-1.5-.7-1.5-1.5v-13z" /><path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H12v16h6.5c.8 0 1.5-.7 1.5-1.5v-13z" /></>,
  atom: <><ellipse cx="12" cy="12" rx="9" ry="3.6" /><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)" /><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)" /><circle cx="12" cy="12" r="1.3" fill="currentColor" /></>,
  dna: <><path d="M7 3c0 6 10 12 10 18M17 3c0 6-10 12-10 18" /><path d="M8 7h8M7.3 12h9.4M8 17h8" /></>,
  bulb: <><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 00-3.5 10.9c.7.5 1 1.1 1 1.9V17h5v-1.2c0-.8.3-1.4 1-1.9A6 6 0 0012 3z" /></>,
  spark: <><path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6L12 3z" /></>,
  handshake: <><path d="M2 12l4-3 3 2 3-2 2 1.5" /><path d="M9 11l3 3.5-2 1.6a1.4 1.4 0 01-2-2l.4-.4" /><path d="M13.5 11.5l3.5 4-1.9 1.6a1.4 1.4 0 01-2-2" /><path d="M18 9l4 3-3 4" /></>,
  code: <><path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13 5l-2 14" /></>,
  flask: <><path d="M10 3h4M10 3v6l-5.5 9.2A1.5 1.5 0 005.8 21h12.4a1.5 1.5 0 001.3-2.8L14 9V3" /><path d="M8 15h8" /></>,
  people: <><circle cx="9" cy="7" r="3" /><path d="M3 21c0-4 2.7-6.5 6-6.5s6 2.5 6 6.5" /><circle cx="17" cy="8" r="2.4" /><path d="M15 14.5c2.7.5 4.5 2.7 4.5 6.5" /></>,
  check: <path d="M5 12.5l4.5 4.5L19 7" />,
  calendar: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 9.5h16" /><path d="M8 3v4M16 3v4" /><circle cx="8.3" cy="14" r="0.9" fill="currentColor" /><circle cx="12" cy="14" r="0.9" fill="currentColor" /><circle cx="15.7" cy="14" r="0.9" fill="currentColor" /></>,
  wifi: <><path d="M2.5 9a14 14 0 0119 0" /><path d="M5.5 12.5a9.5 9.5 0 0113 0" /><path d="M8.5 16a5 5 0 017 0" /><circle cx="12" cy="19" r="0.9" fill="currentColor" /></>,
  cloud: <path d="M7 19h10.5a4 4 0 00.6-7.95A6 6 0 006.4 9.6 4.75 4.75 0 007 19z" />,
  card: <><rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="M3 10h18" /><path d="M7 15h4" /></>,
  chat: <><path d="M4 5.5h16v10H10l-4.5 3.5v-3.5H4v-10z" /><path d="M8 9.5h8M8 12.5h5" /></>,
  cycle: <><path d="M4.5 12a7.5 7.5 0 0113-5" /><path d="M17.5 5v4.5H13" /><path d="M19.5 12a7.5 7.5 0 01-13 5" /><path d="M6.5 19v-4.5H11" /></>,
}

export function Icon({ name, size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name] || paths.spark}
    </svg>
  )
}

export function IconBadge({ name, tone = 'purple', size = 56 }) {
  return (
    <div className={`icon-badge tone-${tone}`} style={{ width: size, height: size }}>
      <Icon name={name} size={size * 0.5} />
    </div>
  )
}

export function CardPhoto({ src, alt }) {
  if (!src) return null
  return (
    <div className="card-photo-wrap">
      <img className="card-photo" src={src} alt={alt} loading="lazy" />
    </div>
  )
}

export function IntroPhoto({ src, alt, round = false }) {
  return (
    <div className={`intro-photo-frame ${round ? 'round' : ''}`}>
      <img className="intro-photo" src={src} alt={alt} loading="lazy" />
    </div>
  )
}
