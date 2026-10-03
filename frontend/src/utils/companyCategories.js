/**
 * Category segregation helper for Job Mela companies
 * Classifies companies into industry verticals (e.g. Banking, Product-Based/IT, Manufacturing, etc.)
 */

export const CATEGORIES = [
  {
    id: 'all',
    label: 'All Categories',
    shortLabel: 'All Sectors',
    badgeClass: 'badge-blue',
    color: '#1e3a8a',
    bg: '#eff6ff',
    border: '#bfdbfe',
    description: 'All verified campus recruiters across all participating industries',
  },
  {
    id: 'banking',
    label: 'Banking & Financial Services',
    shortLabel: 'Banking & Finance',
    badgeClass: 'badge-blue',
    color: '#0369a1',
    bg: '#f0f9ff',
    border: '#bae6fd',
    description: 'Commercial Banks, NBFCs, Wealth Management, Insurance & Microfinance',
  },
  {
    id: 'it_product',
    label: 'IT, Software & Product-Based',
    shortLabel: 'Product-Based & IT',
    badgeClass: 'badge-purple',
    color: '#6d28d9',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    description: 'Software Engineering, Product Development, Cloud Solutions & SaaS',
  },
  {
    id: 'manufacturing',
    label: 'Manufacturing & Automotive',
    shortLabel: 'Manufacturing',
    badgeClass: 'badge-amber',
    color: '#c2410c',
    bg: '#fff7ed',
    border: '#fed7aa',
    description: 'Automobile, Fasteners, Tyres, Precision Components & Assembly',
  },
  {
    id: 'bpo_services',
    label: 'Business Operations, BPO & Sales',
    shortLabel: 'BPO & Services',
    badgeClass: 'badge-green',
    color: '#047857',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    description: 'Customer Support, Telesales, Back Office & Enterprise Services',
  },
  {
    id: 'healthcare',
    label: 'Healthcare & Pharmaceuticals',
    shortLabel: 'Healthcare & Pharma',
    badgeClass: 'badge-red',
    color: '#be123c',
    bg: '#fff1f2',
    border: '#fecdd3',
    description: 'Hospitals, Pharmacy Networks, Clinical Diagnostics & Biotech',
  },
  {
    id: 'core_engineering',
    label: 'Core Engineering & Technical',
    shortLabel: 'Core Engineering',
    badgeClass: 'badge-blue',
    color: '#0e7490',
    bg: '#ecfeff',
    border: '#a5f3fc',
    description: 'Electrical, Solar, Mechanical Systems & Precision Technology',
  },
  {
    id: 'logistics',
    label: 'Logistics, Aviation & Transport',
    shortLabel: 'Logistics & Aviation',
    badgeClass: 'badge-indigo',
    color: '#4338ca',
    bg: '#eef2ff',
    border: '#c7d2fe',
    description: 'Airports, Aviation Ground Staff, Railway Services & Cargo',
  },
  {
    id: 'general',
    label: 'General & Multi-Sector',
    shortLabel: 'General',
    badgeClass: 'badge-gray',
    color: '#475569',
    bg: '#f8fafc',
    border: '#e2e8f0',
    description: 'Multi-domain campus recruiters and placement partners',
  },
];

/**
 * Returns the category object for a given company
 */
export function getCompanyCategory(company) {
  if (!company) return CATEGORIES.find((c) => c.id === 'general');

  const s = String(company.sector || '').trim().toLowerCase();
  const name = String(company.name || '').toLowerCase();
  const pos = String(company.job_position || '').toLowerCase();

  // 1. Banking & Finance
  if (
    s.includes('bank') ||
    s.includes('finance') ||
    s.includes('loan') ||
    name.includes('bank') ||
    name.includes('finance') ||
    name.includes('axis') ||
    name.includes('hdfc') ||
    name.includes('icici') ||
    name.includes('kotak') ||
    name.includes('sbi') ||
    name.includes('chola') ||
    name.includes('muthoot') ||
    name.includes('bajaj') ||
    name.includes('capital') ||
    name.includes('insurance') ||
    name.includes('aditya birla')
  ) {
    return CATEGORIES.find((c) => c.id === 'banking');
  }

  // 2. Healthcare & Pharmaceuticals
  if (
    s.includes('pharma') ||
    s.includes('health') ||
    s.includes('hospital') ||
    name.includes('apollo') ||
    name.includes('aurobindo') ||
    name.includes('dr.reddy') ||
    name.includes('dr reddy') ||
    name.includes('pharma') ||
    name.includes('hospital') ||
    name.includes('clinic') ||
    name.includes('medical')
  ) {
    return CATEGORIES.find((c) => c.id === 'healthcare');
  }

  // 3. Logistics & Aviation
  if (
    s.includes('airport') ||
    s.includes('railway') ||
    s.includes('logistics') ||
    s.includes('aviation') ||
    name.includes('airport') ||
    name.includes('irctc') ||
    name.includes('go fly') ||
    name.includes('airline') ||
    name.includes('cargo') ||
    name.includes('railway') ||
    name.includes('logistics')
  ) {
    return CATEGORIES.find((c) => c.id === 'logistics');
  }

  // 4. Product-Based, IT & Software
  if (
    s.includes('product') ||
    pos.includes('product') ||
    name.includes('product') ||
    ((s.includes('it') || s.includes('software') || s.includes('tech')) &&
      !s.includes('non it') &&
      !s.includes('technicle & core') &&
      !s.includes('production')) ||
    name.includes('software') ||
    name.includes('developer') ||
    name.includes('systems') ||
    name.includes('infotech') ||
    name.includes('adaptamed') ||
    name.includes('aja software') ||
    name.includes('24/7 jobs')
  ) {
    return CATEGORIES.find((c) => c.id === 'it_product');
  }

  // 5. Manufacturing & Automotive
  if (
    s.includes('automobile') ||
    s.includes('manufacturing') ||
    s.includes('manfacturing') ||
    s.includes('production') ||
    s.includes('fmcg') ||
    s.includes('agro') ||
    name.includes('automotive') ||
    name.includes('tyres') ||
    name.includes('motors') ||
    name.includes('fasteners') ||
    name.includes('tvs') ||
    name.includes('mrf') ||
    name.includes('ceat') ||
    name.includes('motherson') ||
    name.includes('rane') ||
    name.includes('daeseong') ||
    name.includes('kiml') ||
    name.includes('thermal') ||
    name.includes('autoparts') ||
    name.includes('leewon') ||
    name.includes('tata electronics')
  ) {
    return CATEGORIES.find((c) => c.id === 'manufacturing');
  }

  // 6. Core Engineering & Technical
  if (
    s.includes('technicle & core') ||
    s.includes('technical') ||
    s.includes('core') ||
    s.includes('technicians') ||
    name.includes('transenergy') ||
    name.includes('solar') ||
    name.includes('power') ||
    name.includes('precision')
  ) {
    return CATEGORIES.find((c) => c.id === 'core_engineering');
  }

  // 7. BPO & Services
  if (
    s.includes('bpo') ||
    s.includes('marketing') ||
    s.includes('sales') ||
    s.includes('service') ||
    s.includes('security') ||
    s.includes('hospitality') ||
    s.includes('non it') ||
    name.includes('genpact') ||
    name.includes('calibehr')
  ) {
    return CATEGORIES.find((c) => c.id === 'bpo_services');
  }

  return CATEGORIES.find((c) => c.id === 'general');
}
