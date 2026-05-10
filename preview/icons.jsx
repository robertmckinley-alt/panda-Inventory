// Tiny inline SVG icon set, sized 1em.
function I({ d, size = 14, stroke = "currentColor", strokeWidth = 2, fill = "none", viewBox = "0 0 24 24" }) {
  return (
    <svg width={size} height={size} viewBox={viewBox} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {d}
    </svg>
  );
}

const Icon = {
  Dashboard: (p) => <I {...p} d={<>
    <rect x="3" y="3" width="7" height="9"/>
    <rect x="14" y="3" width="7" height="5"/>
    <rect x="14" y="12" width="7" height="9"/>
    <rect x="3" y="16" width="7" height="5"/>
  </>}/>,
  Package: (p) => <I {...p} d={<>
    <path d="m7.5 4.27 9 5.15"/>
    <path d="M21 8 12 13 3 8"/>
    <path d="M3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8z"/>
    <path d="M12 22V13"/>
  </>}/>,
  Bell: (p) => <I {...p} d={<>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
  </>}/>,
  Boxes: (p) => <I {...p} d={<>
    <path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19.05v-5.42L7 16.5l-4.03-2.42z"/>
    <path d="M7 16.5v5.5"/><path d="M12 13.63 17 16.5l4.03-2.42a2 2 0 0 0 .97-1.71v-2.86a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0L12 8.05z"/>
    <path d="M17 16.5v5.5"/>
  </>}/>,
  Sun: (p) => <I {...p} d={<>
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
  </>}/>,
  Moon: (p) => <I {...p} d={<>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </>}/>,
  Refresh: (p) => <I {...p} d={<>
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
    <path d="M3 21v-5h5"/>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
    <path d="M21 3v5h-5"/>
  </>}/>,
  Download: (p) => <I {...p} d={<>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </>}/>,
  Send: (p) => <I {...p} d={<>
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </>}/>,
  Search: (p) => <I {...p} d={<>
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </>}/>,
  ArrowUpDown: (p) => <I {...p} d={<>
    <path d="m21 16-4 4-4-4"/>
    <path d="M17 20V4"/>
    <path d="m3 8 4-4 4 4"/>
    <path d="M7 4v16"/>
  </>}/>,
  ArrowRight: (p) => <I {...p} d={<>
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </>}/>,
  Dollar: (p) => <I {...p} d={<>
    <line x1="12" y1="2" x2="12" y2="22"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </>}/>,
  Alert: (p) => <I {...p} d={<>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </>}/>,
  Gauge: (p) => <I {...p} d={<>
    <path d="m12 14 4-4"/>
    <path d="M3.34 19a10 10 0 1 1 17.32 0"/>
  </>}/>,
  Clock: (p) => <I {...p} d={<>
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </>}/>,
  ArrowDownCircle: (p) => <I {...p} d={<>
    <circle cx="12" cy="12" r="10"/>
    <polyline points="8 12 12 16 16 12"/>
    <line x1="12" y1="8" x2="12" y2="16"/>
  </>}/>,
  ArrowUpCircle: (p) => <I {...p} d={<>
    <circle cx="12" cy="12" r="10"/>
    <polyline points="16 12 12 8 8 12"/>
    <line x1="12" y1="16" x2="12" y2="8"/>
  </>}/>,
  Truck: (p) => <I {...p} d={<>
    <path d="M5 18H3V6h13v12h-3"/>
    <path d="M14 9h4l3 3v6h-2"/>
    <circle cx="7.5" cy="18.5" r="2.5"/>
    <circle cx="17.5" cy="18.5" r="2.5"/>
  </>}/>,
  Flame: (p) => <I {...p} d={<>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </>}/>,
  ArrowDown: (p) => <I {...p} d={<>
    <line x1="12" y1="5" x2="12" y2="19"/>
    <polyline points="19 12 12 19 5 12"/>
  </>}/>,
  ArrowUp: (p) => <I {...p} d={<>
    <line x1="12" y1="19" x2="12" y2="5"/>
    <polyline points="5 12 12 5 19 12"/>
  </>}/>
};

window.Icon = Icon;
