export function MapProductMock() {
  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-[#1a2a32]">
      <svg
        viewBox="0 0 640 400"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="home-map-glow" cx="42%" cy="48%" r="55%">
            <stop offset="0%" stopColor="#00BF78" stopOpacity="0.55" />
            <stop offset="45%" stopColor="#0070DE" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#1a2a32" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="home-map-band" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#7FDEBB" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0070DE" stopOpacity="0.08" />
          </linearGradient>
        </defs>
        <rect width="640" height="400" fill="#141c22" />
        {Array.from({ length: 12 }, (_, i) => (
          <line
            key={`v-${i}`}
            x1={40 + i * 50}
            y1="0"
            x2={40 + i * 50}
            y2="400"
            stroke="#ffffff"
            strokeOpacity="0.04"
          />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={30 + i * 48}
            x2="640"
            y2={30 + i * 48}
            stroke="#ffffff"
            strokeOpacity="0.04"
          />
        ))}
        <ellipse cx="270" cy="190" rx="210" ry="150" fill="url(#home-map-glow)" />
        <path
          d="M80 250 C140 210, 180 170, 250 165 C310 160, 340 190, 390 175 C450 155, 500 120, 580 130"
          fill="none"
          stroke="#8FB5ED"
          strokeOpacity="0.45"
          strokeWidth="2"
        />
        <path
          d="M70 290 C150 260, 210 230, 280 240 C360 252, 430 210, 560 220"
          fill="none"
          stroke="#00BF78"
          strokeOpacity="0.35"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <circle cx="292" cy="188" r="44" fill="url(#home-map-band)" />
        <circle cx="292" cy="188" r="7" fill="#00BF78" />
        <circle cx="292" cy="188" r="16" fill="none" stroke="#BFEFDD" strokeWidth="1.5" />
      </svg>
      <div className="absolute top-3 left-3 rounded-md bg-dark/70 px-2.5 py-1.5 text-2xs font-medium tracking-wide text-white backdrop-blur-sm">
        Amsterdam · 52.37°N 4.90°E
      </div>
      <div className="absolute right-3 bottom-3 left-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-dark/75 px-3 py-2 text-2xs text-white backdrop-blur-sm">
        <span className="font-semibold text-primary-50">GFS</span>
        <span className="text-white/70">Temperature</span>
        <span className="hidden sm:inline text-white/50">Latest run</span>
        <span className="h-1.5 w-24 overflow-hidden rounded-full bg-white/15 sm:w-32">
          <span className="block h-full w-2/3 rounded-full bg-primary" />
        </span>
      </div>
    </div>
  )
}

export function TimeseriesProductMock() {
  const hours = ['06', '09', '12', '15', '18', '21']
  const rows = [
    {
      label: 'Temp',
      values: ['8°', '11°', '14°', '16°', '13°', '10°'],
      tones: [
        'bg-marine-25 text-marine-200',
        'bg-primary-25 text-dark',
        'bg-primary-50 text-dark',
        'bg-primary text-white',
        'bg-primary-50 text-dark',
        'bg-marine-25 text-marine-200',
      ],
    },
    {
      label: 'Wind',
      values: ['12', '14', '18', '16', '11', '9'],
      tones: [
        'bg-cloud-400 text-dark/70',
        'bg-cloud-300 text-dark/80',
        'bg-marine-25 text-marine-200',
        'bg-cloud-300 text-dark/80',
        'bg-cloud-400 text-dark/70',
        'bg-cloud-500 text-dark/60',
      ],
    },
    {
      label: 'Precip',
      values: ['0.0', '0.2', '1.4', '0.6', '0.0', '0.0'],
      tones: [
        'bg-white text-dark/50',
        'bg-marine-25/70 text-marine-200',
        'bg-marine-50 text-marine-200',
        'bg-marine-25 text-marine-200',
        'bg-white text-dark/50',
        'bg-white text-dark/50',
      ],
    },
  ]

  return (
    <div className="flex aspect-[16/10] flex-col justify-center overflow-hidden bg-white p-4">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="m-0 text-xs font-semibold text-dark">Point forecast</p>
        <p className="m-0 text-2xs text-dark/45">lat 52.37 · lon 4.90</p>
      </div>
      <table className="w-full border-collapse text-center text-2xs">
        <thead>
          <tr>
            <th className="pb-2 text-left font-medium text-dark/40">Element</th>
            {hours.map((hour) => (
              <th key={hour} className="pb-2 font-medium text-dark/40">
                {hour}:00
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th className="py-1 pr-2 text-left font-semibold text-dark">{row.label}</th>
              {row.values.map((value, index) => (
                <td key={`${row.label}-${hours[index]}`} className="p-0.5">
                  <span
                    className={`flex h-8 items-center justify-center rounded-md font-medium ${row.tones[index]}`}
                  >
                    {value}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function EnsembleProductMock() {
  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-white p-4">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p className="m-0 text-xs font-semibold text-dark">Ensemble plume</p>
        <p className="m-0 text-2xs text-dark/45">Temperature · 51 members</p>
      </div>
      <svg viewBox="0 0 560 260" className="h-[calc(100%-1.5rem)] w-full" aria-hidden="true">
        <defs>
          <linearGradient id="home-plume" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#00BF78" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#0070DE" stopOpacity="0.08" />
          </linearGradient>
        </defs>
        {[40, 90, 140, 190, 240].map((y) => (
          <line
            key={y}
            x1="36"
            x2="540"
            y1={y}
            y2={y}
            stroke="#2E2E2B"
            strokeOpacity="0.08"
          />
        ))}
        <path
          d="M40 150 C110 130, 170 90, 240 100 C310 110, 370 70, 440 85 C490 95, 520 78, 540 70 L540 190 C510 200, 470 210, 430 205 C360 195, 300 220, 240 200 C170 178, 110 210, 40 195 Z"
          fill="url(#home-plume)"
        />
        <path
          d="M40 168 C110 150, 170 128, 240 132 C310 136, 370 118, 440 128 C490 135, 520 122, 540 118"
          fill="none"
          stroke="#0070DE"
          strokeOpacity="0.35"
          strokeWidth="1.5"
        />
        <path
          d="M40 132 C110 118, 170 88, 240 96 C310 104, 370 78, 440 92 C490 100, 520 82, 540 76"
          fill="none"
          stroke="#00BF78"
          strokeOpacity="0.4"
          strokeWidth="1.5"
        />
        <path
          d="M40 150 C110 132, 170 110, 240 114 C310 118, 370 96, 440 108 C490 116, 520 100, 540 96"
          fill="none"
          stroke="#00BF78"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <text x="8" y="44" fill="#969694" fontSize="10">
          16°
        </text>
        <text x="8" y="144" fill="#969694" fontSize="10">
          10°
        </text>
        <text x="8" y="244" fill="#969694" fontSize="10">
          4°
        </text>
      </svg>
    </div>
  )
}
