// Minimal inline SVG icons (no dependency). All use currentColor so they
// inherit text color. Pass `size` to scale.
const S = ({ size = 18, children, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...rest}
  >
    {children}
  </svg>
);

export const IconDashboard = (p) => (
  <S {...p}><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></S>
);
export const IconProducts = (p) => (
  <S {...p}><path d="M3.5 8 12 3l8.5 5v8L12 21l-8.5-5z" /><path d="M3.5 8 12 13l8.5-5" /><path d="M12 13v8" /></S>
);
export const IconCollections = (p) => (
  <S {...p}><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></S>
);
export const IconOffers = (p) => (
  <S {...p}><path d="M3 11 12 3l9 8" /><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" /><path d="m9.5 14.5 5-5" /><circle cx="9.7" cy="10" r=".6" /><circle cx="14.3" cy="14.5" r=".6" /></S>
);
export const IconHome = (p) => (
  <S {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9 21v-6h6v6" /></S>
);
export const IconOrders = (p) => (
  <S {...p}><path d="M6 2h12l1.5 4H4.5z" /><path d="M5 6v14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6" /><path d="M9 11a3 3 0 0 0 6 0" /></S>
);
export const IconLogout = (p) => (
  <S {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></S>
);
export const IconPlus = (p) => (<S {...p}><path d="M12 5v14M5 12h14" /></S>);
export const IconEdit = (p) => (<S {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></S>);
export const IconTrash = (p) => (<S {...p}><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M6 6v14a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V6" /><path d="M10 11v6M14 11v6" /></S>);
export const IconClose = (p) => (<S {...p}><path d="M18 6 6 18M6 6l12 12" /></S>);
export const IconPercent = (p) => (<S {...p}><path d="M19 5 5 19" /><circle cx="7.5" cy="7.5" r="2.5" /><circle cx="16.5" cy="16.5" r="2.5" /></S>);
export const IconImage = (p) => (<S {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></S>);
export const IconMenu = (p) => (<S {...p}><path d="M3 6h18M3 12h18M3 18h18" /></S>);
export const IconEye = (p) => (<S {...p}><path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z" /><circle cx="12" cy="12" r="3" /></S>);
export const IconExternal = (p) => (<S {...p}><path d="M14 4h6v6" /><path d="M20 4 10 14" /><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" /></S>);
export const IconCheck = (p) => (<S {...p}><path d="m20 6-11 11-5-5" /></S>);
