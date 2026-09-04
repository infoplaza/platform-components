export const supportedUnits = ['m/s', 'km/h', 'kt', 'mph', 'Bft'] as const

export type WindspeedUnit = (typeof supportedUnits)[number]

export type WindspeedRange = {
  min: string
  max: string | null
}

export type BeaufortScaleItem = {
  scale: number
  name: string
  color: string
  windspeed: Record<WindspeedUnit, WindspeedRange>
}

export type BeaufortScaleOverrides = {
  basic: {
    graph: {
      y: Record<
        string,
        {
          fill?: string
          opacity?: number
          stroke?: string
        }
      >
    }
  }
}

export type GradeRange = {
  min?: number
  max?: number
}

export type WindDirectionChanceGradeItem = {
  point: string
  slug: string
  abbreviation: string
  color: string
  range: GradeRange[]
}

export type PrecipitationProbabilityMember = {
  label: string
  slug: string
  color: string
  range: GradeRange[]
}

export type TotalCloudCoverageGradeItem = {
  title: string
  slug: string
  color: string
  range: GradeRange[]
}

export type FrostProbabilityMember = {
  label: string
  slug: string
  color: string
  range: GradeRange[]
}

export type PrecipitationTypeMember = {
  title: string
  slug: string
  color: string
  value: number | null
}

export const BeaufortScale: BeaufortScaleItem[] = [
  {
    scale: 0,
    name: 'Calm',
    color: '#0970b2',
    windspeed: {
      'm/s': { min: '0', max: '0.3' },
      'km/h': { min: '0', max: '1' },
      kt: { min: '0', max: '1' },
      mph: { min: '0', max: '1' },
      Bft: { min: '0', max: '1' },
    },
  },
  {
    scale: 1,
    name: 'Light air',
    color: '#0c77bf',
    windspeed: {
      'm/s': { min: '0.3', max: '1.6' },
      'km/h': { min: '1', max: '6' },
      kt: { min: '1', max: '4' },
      mph: { min: '1', max: '4' },
      Bft: { min: '1', max: '2' },
    },
  },
  {
    scale: 2,
    name: 'Light breeze',
    color: '#0d92d6',
    windspeed: {
      'm/s': { min: '1.6', max: '3.4' },
      'km/h': { min: '6', max: '12' },
      kt: { min: '4', max: '7' },
      mph: { min: '4', max: '8' },
      Bft: { min: '2', max: '3' },
    },
  },
  {
    scale: 3,
    name: 'Gentle breeze',
    color: '#109dce',
    windspeed: {
      'm/s': { min: '3.4', max: '5.5' },
      'km/h': { min: '12', max: '20' },
      kt: { min: '7', max: '11' },
      mph: { min: '8', max: '13' },
      Bft: { min: '3', max: '4' },
    },
  },
  {
    scale: 4,
    name: 'Moderate breeze',
    color: '#18ac56',
    windspeed: {
      'm/s': { min: '5.5', max: '8.0' },
      'km/h': { min: '20', max: '29' },
      kt: { min: '11', max: '17' },
      mph: { min: '13', max: '19' },
      Bft: { min: '4', max: '5' },
    },
  },
  {
    scale: 5,
    name: 'Fresh breeze',
    color: '#4dbe10',
    windspeed: {
      'm/s': { min: '8.0', max: '10.8' },
      'km/h': { min: '29', max: '39' },
      kt: { min: '17', max: '22' },
      mph: { min: '19', max: '25' },
      Bft: { min: '5', max: '6' },
    },
  },
  {
    scale: 6,
    name: 'Strong breeze',
    color: '#aad60d',
    windspeed: {
      'm/s': { min: '10.8', max: '13.9' },
      'km/h': { min: '39', max: '50' },
      kt: { min: '22', max: '28' },
      mph: { min: '25', max: '32' },
      Bft: { min: '6', max: '7' },
    },
  },
  {
    scale: 7,
    name: 'Near gale',
    color: '#f0d116',
    windspeed: {
      'm/s': { min: '13.9', max: '17.2' },
      'km/h': { min: '50', max: '62' },
      kt: { min: '28', max: '34' },
      mph: { min: '32', max: '39' },
      Bft: { min: '7', max: '8' },
    },
  },
  {
    scale: 8,
    name: 'Gale',
    color: '#e69323',
    windspeed: {
      'm/s': { min: '17.2', max: '20.8' },
      'km/h': { min: '62', max: '75' },
      kt: { min: '34', max: '41' },
      mph: { min: '39', max: '47' },
      Bft: { min: '8', max: '9' },
    },
  },
  {
    scale: 9,
    name: 'Strong gale',
    color: '#d81424',
    windspeed: {
      'm/s': { min: '20.8', max: '24.5' },
      'km/h': { min: '75', max: '89' },
      kt: { min: '41', max: '48' },
      mph: { min: '47', max: '55' },
      Bft: { min: '9', max: '10' },
    },
  },
  {
    scale: 10,
    name: 'Storm',
    color: '#b70f4b',
    windspeed: {
      'm/s': { min: '24.5', max: '28.5' },
      'km/h': { min: '89', max: '103' },
      kt: { min: '48', max: '56' },
      mph: { min: '55', max: '64' },
      Bft: { min: '10', max: '11' },
    },
  },
  {
    scale: 11,
    name: 'Violent storm',
    color: '#9d086c',
    windspeed: {
      'm/s': { min: '28.5', max: '32.7' },
      'km/h': { min: '103', max: '118' },
      kt: { min: '56', max: '64' },
      mph: { min: '64', max: '75' },
      Bft: { min: '11', max: '12' },
    },
  },
  {
    scale: 12,
    name: 'Hurricane',
    color: '#84055a',
    windspeed: {
      'm/s': { min: '32.7', max: null },
      'km/h': { min: '118', max: null },
      kt: { min: '64', max: null },
      mph: { min: '75', max: null },
      Bft: { min: '12', max: null },
    },
  },
]

export const BeaufortScaleOverrides: BeaufortScaleOverrides = {
  basic: {
    graph: {
      y: {
        min_max: { fill: '#2E2E2B', opacity: 0.4 },
        percentile10_percentile90: { fill: '#2E2E2B', opacity: 0.7 },
        percentile25_percentile75: { fill: '#2E2E2B', opacity: 0.8 },
        median: { stroke: '#FFFFFF' },
      },
    },
  },
}

export const WindDirectionChanceGrade: WindDirectionChanceGradeItem[] = [
  {
    point: 'North',
    slug: 'north',
    abbreviation: 'N',
    color: '#46995f',
    range: [
      { min: 337.5, max: 360 },
      { min: 0, max: 22.5 },
    ],
  },
  {
    point: 'Northeast',
    slug: 'northeast',
    abbreviation: 'NE',
    color: '#36ade4',
    range: [{ min: 22.5, max: 67.5 }],
  },
  {
    point: 'East',
    slug: 'east',
    abbreviation: 'E',
    color: '#6269cd',
    range: [{ min: 67.5, max: 112.5 }],
  },
  {
    point: 'Southeast',
    slug: 'southeast',
    abbreviation: 'SE',
    color: '#d674d7',
    range: [{ min: 112.5, max: 157.5 }],
  },
  {
    point: 'South',
    slug: 'south',
    abbreviation: 'S',
    color: '#e73b42',
    range: [{ min: 157.5, max: 202.5 }],
  },
  {
    point: 'Southwest',
    slug: 'southwest',
    abbreviation: 'SW',
    color: '#f4a977',
    range: [{ min: 202.5, max: 247.5 }],
  },
  {
    point: 'West',
    slug: 'west',
    abbreviation: 'W',
    color: '#f4eb36',
    range: [{ min: 247.5, max: 292.5 }],
  },
  {
    point: 'Northwest',
    slug: 'northwest',
    abbreviation: 'NW',
    color: '#bad88e',
    range: [{ min: 292.5, max: 337.5 }],
  },
]

export const PrecipitationProbabilityMembers: PrecipitationProbabilityMember[] =
  [
    {
      label: '> 25 mm',
      slug: '25mm',
      color: '#010D12',
      range: [{ min: 25, max: 1000 }],
    },
    {
      label: '> 10 mm',
      slug: '10mm',
      color: '#063349',
      range: [{ min: 10, max: 25 }],
    },
    {
      label: '> 3 mm',
      slug: '3mm',
      color: '#0A5880',
      range: [{ min: 3, max: 10 }],
    },
    {
      label: '> 1 mm',
      slug: '1mm',
      color: '#1197DA',
      range: [{ min: 1, max: 3 }],
    },
    {
      label: '> 0.3 mm',
      slug: '0.3mm',
      color: '#80CEF5',
      range: [{ min: 0.3, max: 1 }],
    },
  ]

export const TotalCloudCoverageGrade: TotalCloudCoverageGradeItem[] = [
  {
    title: 'Overcast',
    slug: 'overcast',
    color: '#666666',
    range: [{ min: 90, max: 100 }],
  },
  {
    title: 'Mostly cloudy',
    slug: 'mostly_cloudy',
    color: '#B4B4B4',
    range: [{ min: 65, max: 90 }],
  },
  {
    title: 'Partly cloudy',
    slug: 'partly_cloudy',
    color: '#DFD3A9',
    range: [{ min: 35, max: 65 }],
  },
  {
    title: 'Slightly cloudy',
    slug: 'slightly_cloudy',
    color: '#FFE489',
    range: [{ min: 10, max: 35 }],
  },
  {
    title: 'Clear sky',
    slug: 'clear_sky',
    color: '#FFC500',
    range: [{ min: 0, max: 10 }],
  },
]

export const FrostMinProbabilityMembers: FrostProbabilityMember[] = [
  {
    label: 'Minimum temperature < 0°C',
    slug: 'minimum_temperature_lt_0',
    color: '#80CEF5',
    range: [{ max: -0.1, min: -100 }],
  },
]

export const FrostMaxProbabilityMembers: FrostProbabilityMember[] = [
  {
    label: 'Maximum temperature < 0°C',
    slug: 'maximum_temperature_lt_0',
    color: '#1197DA',
    range: [{ max: -0.1, min: -100 }],
  },
]

export const PrecipitationTypeMembers: PrecipitationTypeMember[] = [
  { title: 'No data', slug: 'nodata', color: '#777777', value: null },
  { title: 'Dry', slug: 'dry', color: '#CCCCCC', value: 0 },
  { title: 'Rain', slug: 'rain', color: '#36ade4', value: 1 },
  { title: 'Snow', slug: 'snow', color: '#FEA0FF', value: 5 },
  { title: 'Wet snow', slug: 'wet_snow', color: '#6269CD', value: 6 },
  { title: 'Ice', slug: 'ice', color: '#E73B42', value: 3 },
  { title: 'Ice pellets', slug: 'ice_pellets', color: '#F4A977', value: 8 },
  { title: 'Mix', slug: 'mix', color: '#469960', value: 7 },
]

export const ProbabilityOverviewMembers: FrostProbabilityMember[] = [
  {
    label: 'Frost < 0°C',
    slug: 'frost_lt_0',
    color: '#87CEEB',
    range: [{ max: 0, min: -5 }],
  },
  {
    label: 'Moderate frost < -5°C',
    slug: 'moderate_frost_lt_5',
    color: '#4682B4',
    range: [{ max: -5, min: -10 }],
  },
  {
    label: 'Hard frost < -10°C',
    slug: 'hard_frost_lt_10',
    color: '#6A5ACD',
    range: [{ max: -10, min: -15 }],
  },
  {
    label: 'Severe frost < -15°C',
    slug: 'severe_frost_lt_15',
    color: '#4B0082',
    range: [{ max: -15, min: -100 }],
  },
]
