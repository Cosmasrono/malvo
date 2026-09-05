import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/** All icons share a 24×24 box, 1.6 stroke and round caps so the set reads as one family. */
function Base({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function BladeIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="2.2" />
      <path d="M12 9.8V3m2.1 9.2 5.9-3.4M14 13.9l3 5.2M10 13.9l-3 5.2M9.9 12.2 4 8.8" />
    </Base>
  );
}

export function GrainIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 21V9" />
      <path d="M12 9c0-3.3 1.6-6 4-7 0 3.9-1.4 6.4-4 7Z" />
      <path d="M12 14c0-3.3-1.6-6-4-7 0 3.9 1.4 6.4 4 7Z" />
      <path d="M5 21h14" />
    </Base>
  );
}

export function GaugeIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4.5 17a8.5 8.5 0 1 1 15 0" />
      <path d="m12 13 3.8-3.4" />
      <circle cx="12" cy="14.2" r="1.3" />
      <path d="M3 20.5h18" />
    </Base>
  );
}

export function PlugIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M9 3v5m6-5v5" />
      <path d="M6 8h12v3a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8Z" />
      <path d="M12 17v4" />
    </Base>
  );
}

export function DropIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3s6 6.3 6 10.2A6 6 0 0 1 6 13.2C6 9.3 12 3 12 3Z" />
      <path d="M9.4 13.6a2.7 2.7 0 0 0 2.6 2.7" />
    </Base>
  );
}

export function BoltIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M13.2 2 4.8 13.2h5.6L9.8 22l8.4-11.2h-5.6L13.2 2Z" />
    </Base>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M3 21 12.6 11.4" />
      <path d="m10.6 9.4 4 4" />
      <path d="M14.5 7.5 16.5 5.5" />
      <path d="M18 9 21 6" />
      <path d="m16.4 12.6 3.6.9" />
      <path d="M13 4.5 12.1 1" />
    </Base>
  );
}

export function DiscIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="8.5" cy="12" r="5.5" />
      <circle cx="8.5" cy="12" r="1.2" />
      <path d="M14 9.6h6.2a.8.8 0 0 1 .8.8v3.2a.8.8 0 0 1-.8.8H14" />
    </Base>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M5.5 3.5h3l1.5 4-2 1.4a12 12 0 0 0 5.1 5.1l1.4-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3.5 5.7a2 2 0 0 1 2-2.2Z" />
    </Base>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </Base>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.2l3.2 2" />
    </Base>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="m4.5 12.5 5 5 10-11" />
    </Base>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3 5 5.8v5.4c0 4.3 2.9 8.1 7 9.3 4.1-1.2 7-5 7-9.3V5.8L12 3Z" />
      <path d="m9 12 2.2 2.2L15.2 10" />
    </Base>
  );
}

export function ToolIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M14.8 6.2a4 4 0 0 0 5 5L14.3 16.7l-3.7 3.7a2.1 2.1 0 0 1-3-3l3.7-3.7 3.5-7.5Z" />
      <path d="M9.6 9.6 5.4 5.4" />
    </Base>
  );
}

export function TruckIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M3 6.5h10.5v9H3z" />
      <path d="M13.5 9.5H17l3 3v3h-6.5" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="16.5" cy="17.5" r="1.8" />
    </Base>
  );
}

export function ChatIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M20 12.5A7.5 7.5 0 0 1 8.7 19L4 20.2l1.3-4.5A7.5 7.5 0 1 1 20 12.5Z" />
    </Base>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.74.46 3.44 1.32 4.94L2.1 22l5.36-1.4a9.8 9.8 0 0 0 4.58 1.17h.01c5.43 0 9.84-4.4 9.84-9.84C21.89 6.4 17.48 2 12.04 2Zm0 17.93h-.01a8.2 8.2 0 0 1-4.16-1.14l-.3-.18-3.18.83.85-3.1-.2-.32a8.13 8.13 0 0 1-1.25-4.35c0-4.52 3.68-8.19 8.2-8.19a8.15 8.15 0 0 1 8.18 8.2c0 4.51-3.67 8.18-8.13 8.18Zm4.49-6.13c-.25-.13-1.45-.72-1.68-.8-.22-.08-.39-.12-.55.12-.16.25-.62.8-.77.96-.14.17-.28.19-.53.06-.24-.12-1.03-.38-1.97-1.22-.73-.65-1.22-1.45-1.36-1.7-.14-.24-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.55-1.33-.76-1.82-.2-.47-.4-.4-.55-.41h-.47c-.16 0-.43.06-.65.3-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.13.17 1.73 2.64 4.2 3.7.58.26 1.04.41 1.4.52.59.19 1.13.16 1.55.1.47-.07 1.45-.59 1.66-1.17.2-.57.2-1.06.14-1.16-.06-.11-.22-.17-.47-.29Z" />
    </svg>
  );
}

export function GearIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="3.1" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.55V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 8.9 19.3a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1.03H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.7 8.9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1.03-1.55V3a2 2 0 1 1 4 0v.1A1.7 1.7 0 0 0 15.1 4.7a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9v.09a1.7 1.7 0 0 0 1.55 1.02H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </Base>
  );
}

export function CartIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="9" cy="20" r="1.3" />
      <circle cx="18" cy="20" r="1.3" />
      <path d="M2.5 3h2.2l2.3 11.2a1.6 1.6 0 0 0 1.6 1.3h8.8a1.6 1.6 0 0 0 1.6-1.3L21 7H6" />
    </Base>
  );
}
