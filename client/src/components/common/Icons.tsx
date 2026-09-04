import type { SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement>;

/** Shared attributes for every icon — inherits text color, sized via width/height. */
function svgProps(props: IconProps, size = 20): IconProps {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    ...props,
  };
}

export function IconDashboard(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <rect x="3" y="3" width="7.5" height="9" rx="1.5" />
      <rect x="13.5" y="3" width="7.5" height="5.5" rx="1.5" />
      <rect x="13.5" y="12" width="7.5" height="9" rx="1.5" />
      <rect x="3" y="15.5" width="7.5" height="5.5" rx="1.5" />
    </svg>
  );
}

export function IconStations(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M12 21.5s-7-5.4-7-11.2a7 7 0 0 1 14 0c0 5.8-7 11.2-7 11.2z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

export function IconCargo(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M3.4 7.6 12 3l8.6 4.6v8.8L12 21l-8.6-4.6z" />
      <path d="M3.4 7.6 12 12.2l8.6-4.6" />
      <path d="M12 12.2V21" />
    </svg>
  );
}

export function IconInventory(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="m12 2.5 9.5 4.6L12 11.7 2.5 7.1z" />
      <path d="m2.5 12.2 9.5 4.6 9.5-4.6" />
      <path d="m2.5 16.8 9.5 4.6 9.5-4.6" />
    </svg>
  );
}

export function IconPersonnel(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M16.5 21v-1.8a4.2 4.2 0 0 0-4.2-4.2H6.2a4.2 4.2 0 0 0-4.2 4.2V21" />
      <circle cx="9.2" cy="7.4" r="4.1" />
      <path d="M22 21v-1.8a4.2 4.2 0 0 0-3.3-4.1" />
      <path d="M15.8 3.4a4.1 4.1 0 0 1 0 8" />
    </svg>
  );
}

export function IconEmergency(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M10.3 3.8 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0z" />
      <path d="M12 9v4.2" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function IconSettings(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M3 6.5h11.5" />
      <circle cx="17.8" cy="6.5" r="2.3" />
      <path d="M21 17.5H9.5" />
      <circle cx="6.2" cy="17.5" r="2.3" />
    </svg>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <circle cx="11" cy="11" r="6.8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function IconBell(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M18 8.2a6 6 0 1 0-12 0c0 6.5-2.6 8.3-2.6 8.3h17.2S18 14.7 18 8.2z" />
      <path d="M13.7 20a2 2 0 0 1-3.4 0" />
    </svg>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M4 6.5h16" />
      <path d="M4 12h16" />
      <path d="M4 17.5h16" />
    </svg>
  );
}

export function IconX(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </svg>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="m6 9.5 6 6 6-6" />
    </svg>
  );
}

export function IconChevronsLeft(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="m11.5 17.5-6-5.5 6-5.5" />
      <path d="m18.5 17.5-6-5.5 6-5.5" />
    </svg>
  );
}

export function IconHelp(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.2 9.2a2.9 2.9 0 0 1 5.6 1.2c0 1.9-2.8 2.4-2.8 3.8" />
      <path d="M12 17.4h.01" />
    </svg>
  );
}

export function IconLogout(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" />
      <path d="m16 16.5 4.5-4.5L16 7.5" />
      <path d="M20.5 12H9" />
    </svg>
  );
}

export function IconSnowflake(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M12 2.5v19" />
      <path d="M4.1 7 19.9 17" />
      <path d="M19.9 7 4.1 17" />
    </svg>
  );
}

export function IconAlertTriangle(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M10.3 3.8 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0z" />
      <path d="M12 9v4.2" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function IconArrowRight(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M4 12h15.5" />
      <path d="m13.5 6 6 6-6 6" />
    </svg>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

export function IconRefresh(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M20.5 12a8.5 8.5 0 1 1-2.5-6" />
      <path d="M20.5 3.5V6h-2.5" />
    </svg>
  );
}

export function IconBox(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M21 8.2 12 3 3 8.2v7.6L12 21l9-5.2z" />
      <path d="M3.2 8.3 12 13.4l8.8-5.1" />
      <path d="M12 13.4V21" />
    </svg>
  );
}

export function IconClock(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6.8V12l3.4 2" />
    </svg>
  );
}

export function IconMapPin(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M12 21.5s-6.8-5.3-6.8-11a6.8 6.8 0 0 1 13.6 0c0 5.7-6.8 11-6.8 11z" />
      <circle cx="12" cy="10.2" r="2.5" />
    </svg>
  );
}

export function IconUser(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

export function IconFlame(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M12 21c3.9 0 6.5-2.4 6.5-6.1 0-2.6-1.5-4.6-3-6.4-.6 1-1.2 1.5-2 2 0-2.4-.8-5-2.5-6.4 0 2.8-1.2 4.6-2.5 6.2C7 12 5.5 13.4 5.5 14.9 5.5 18.6 8.1 21 12 21z" />
    </svg>
  );
}

export function IconMedkit(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <rect x="3" y="7" width="18" height="13.5" rx="2" />
      <path d="M9 7V4.5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 4.5V7" />
      <path d="M12 10.5v6" />
      <path d="M9 13.5h6" />
    </svg>
  );
}

export function IconWind(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M3 8.5h9a2.5 2.5 0 1 0-2.4-3.2" />
      <path d="M3 12.5h15a2.5 2.5 0 1 1-2.4 3.2" />
      <path d="M3 16.5h7a2 2 0 1 1-1.9 2.6" />
    </svg>
  );
}

export function IconWrench(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M14.7 6.3a4.5 4.5 0 0 0-6 5.6L3 17.6 6.4 21l5.7-5.7a4.5 4.5 0 0 0 5.6-6L14 12.2l-2.2-2.2z" />
    </svg>
  );
}

export function IconShield(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M12 3 5 5.8v5.4c0 4.4 3 8 7 9.8 4-1.8 7-5.4 7-9.8V5.8z" />
      <path d="m8.8 12 2.2 2.2 4.2-4.4" />
    </svg>
  );
}

export function IconShip(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M4 10h16v4.5a3 3 0 0 1-2.4 2.9l-5.6 1.2-5.6-1.2A3 3 0 0 1 4 14.5z" />
      <path d="M2.5 20h19" />
      <path d="M12 3.5 9.2 7h5.6z" />
      <path d="M12 3.5V10" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}
