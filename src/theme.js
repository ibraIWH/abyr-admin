// Palette ported straight from the storefront's designTokens.js so the admin
// shares one source of truth with the web + iOS apps.
export const C = {
  red: '#5C0A14',     // brandRed
  gold: '#C4A882',
  tan: '#8B7355',
  cream: '#F5F0E8',
  sand: '#FAFAF8',
  ink: '#1A1A1A',
  border: '#E8E8E4',
  white: '#FFFFFF',
  green: '#1B5E20',
  amber: '#E65100',
  redAlert: '#C62828',
};

// Product tag → label + colors (matches Product.tag enum: none/bestSeller/sellingFast)
export const TAG_META = {
  none:        { label: '—',            fg: '#9A8F84', bg: 'transparent' },
  bestSeller:  { label: 'Best Seller',  fg: '#6B5A2E', bg: '#F3ECDC' },
  sellingFast: { label: 'Selling Fast', fg: '#8A3A00', bg: '#FBE7D8' },
};

export const TAG_OPTIONS = [
  { value: 'none', label: 'No tag' },
  { value: 'bestSeller', label: 'Best Seller' },
  { value: 'sellingFast', label: 'Selling Fast' },
];

// Order status → label + colors (matches Order.status enum)
export const STATUS_META = {
  placed:    { label: 'Placed',    fg: '#5B5048', bg: '#EFEAE2' },
  confirmed: { label: 'Confirmed', fg: '#5C0A14', bg: '#F4E3E5' },
  shipped:   { label: 'Shipped',   fg: '#8A3A00', bg: '#FBE7D8' },
  delivered: { label: 'Delivered', fg: '#1B5E20', bg: '#E3F0E4' },
  cancelled: { label: 'Cancelled', fg: '#C62828', bg: '#FBE3E3' },
};

export const STATUS_OPTIONS = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'];

// Default size set used by the storefront Product model
export const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL'];

export const SAR = (n) =>
  n == null || n === '' ? '—' : `SAR ${Number(n).toLocaleString('en-US')}`;
