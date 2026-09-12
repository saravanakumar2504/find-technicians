export const SPECIALTIES = [
  'HVAC Specialist',
  'Electrician',
  'Plumber',
  'Network Technician',
  'Carpenter',
  'Painter',
  'AC Repair Technician',
  'Appliance Repair Technician',
] as const;

export type Specialty = (typeof SPECIALTIES)[number];

export const SPECIALTY_FILTER_OPTIONS = ['all', ...SPECIALTIES] as const;
