export interface AncestryRegion {
  id: string;
  name: string;
  percentage: number;
  color: string;
  flag: string;
}

export interface UploadFile {
  name: string;
  size: string;
  type: string;
  format: string;
}

export const ancestryRegions: AncestryRegion[] = [
  { id: 'west-african', name: 'West African', percentage: 45, color: '#00C853', flag: '🇳🇬' },
  { id: 'european', name: 'European', percentage: 25, color: '#38BDF8', flag: '🇪🇺' },
  { id: 'native-american', name: 'Native American', percentage: 15, color: '#F59E0B', flag: '🪶' },
  { id: 'east-african', name: 'East African', percentage: 10, color: '#7E57C2', flag: '🇪🇹' },
  { id: 'other', name: 'Other', percentage: 5, color: '#64748B', flag: '🌍' },
];

export const uploadStages = [
  { label: 'Uploading file...', min: 0, max: 40 },
  { label: 'Encrypting data...', min: 40, max: 60 },
  { label: 'Parsing genetic markers...', min: 60, max: 80 },
  { label: 'Mapping ancestry regions...', min: 80, max: 95 },
  { label: 'Finalizing...', min: 95, max: 100 },
];

export const providerOptions = [
  {
    id: '23andme',
    name: '23andMe',
    description: 'Upload 23andMe Export',
    color: '#00C853',
    bgGradient: 'linear-gradient(135deg, rgba(0,200,83,0.15), rgba(0,200,83,0.05))',
    borderColor: 'rgba(0,200,83,0.3)',
  },
  {
    id: 'ancestry',
    name: 'AncestryDNA',
    description: 'Upload AncestryDNA Export',
    color: '#38BDF8',
    bgGradient: 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(56,189,248,0.05))',
    borderColor: 'rgba(56,189,248,0.3)',
  },
  {
    id: 'raw',
    name: 'Raw Data File',
    description: 'Upload Raw File (CSV/JSON)',
    color: '#F59E0B',
    bgGradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))',
    borderColor: 'rgba(245,158,11,0.3)',
  },
];

export const manualRegions = [
  { id: 'west-africa', name: 'West Africa', flag: '🇳🇬' },
  { id: 'central-africa', name: 'Central Africa', flag: '🇨🇲' },
  { id: 'east-africa', name: 'East Africa', flag: '🇪🇹' },
  { id: 'southern-africa', name: 'Southern Africa', flag: '🇿🇦' },
  { id: 'caribbean', name: 'Caribbean', flag: '🇯🇲' },
  { id: 'afro-latin', name: 'Afro-Latin', flag: '🇧🇷' },
  { id: 'african-american', name: 'African American / Gullah', flag: '🇺🇸' },
  { id: 'north-africa', name: 'North Africa', flag: '🇪🇬' },
];
