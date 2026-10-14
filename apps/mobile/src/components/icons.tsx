import Svg, { Circle, Path, Rect, type SvgProps } from 'react-native-svg';

type IconProps = SvgProps & { size?: number; color?: string; filled?: boolean };

function base({ size = 22, color = '#1B6EF3', ...rest }: IconProps) {
  return { width: size, height: size, color, ...rest };
}

export function HomeIcon(props: IconProps) {
  const { width, height, color, ...rest } = base(props);
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...rest}>
      <Path
        d="M4.5 10.5 12 4l7.5 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-4.2v-5.2h-4.6V20.5H6A1.5 1.5 0 0 1 4.5 19v-8.5Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function FilesIcon(props: IconProps) {
  const { width, height, color, ...rest } = base(props);
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...rest}>
      <Path
        d="M8 4.5h5.2L18 9.3V18.5A1.5 1.5 0 0 1 16.5 20H8A1.5 1.5 0 0 1 6.5 18.5v-12A2 2 0 0 1 8 4.5Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <Path d="M13 4.5V9h4.8" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    </Svg>
  );
}

export function FolderIcon(props: IconProps) {
  const { width, height, color, ...rest } = base(props);
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...rest}>
      <Path
        d="M3.5 8.2A2.2 2.2 0 0 1 5.7 6h4.1l1.6 1.8h6.9A2.2 2.2 0 0 1 20.5 10v7.3a2.2 2.2 0 0 1-2.2 2.2H5.7A2.2 2.2 0 0 1 3.5 17.3V8.2Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function StarIcon(props: IconProps) {
  const { width, height, color, filled, ...rest } = base(props);
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...rest}>
      <Path
        d="m12 3.8 2.35 4.76 5.25.76-3.8 3.7.9 5.23L12 15.9l-4.7 2.45.9-5.23-3.8-3.7 5.25-.76L12 3.8Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill={filled ? color : 'none'}
      />
    </Svg>
  );
}

export function CalendarIcon(props: IconProps) {
  const { width, height, color, ...rest } = base(props);
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...rest}>
      <Rect x="3.5" y="5" width="17" height="15" rx="2.2" stroke={color} strokeWidth="1.8" />
      <Path d="M3.5 9.5h17" stroke={color} strokeWidth="1.8" />
      <Path d="M8 3.5v3" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Path d="M16 3.5v3" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

export function VaultIcon(props: IconProps) {
  const { width, height, color, ...rest } = base(props);
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...rest}>
      <Rect x="3.5" y="5" width="17" height="14.5" rx="2.5" stroke={color} strokeWidth="1.8" />
      <Circle cx="12" cy="12.2" r="3.2" stroke={color} strokeWidth="1.8" />
      <Path d="M12 12.2h3.4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

export function UserIcon(props: IconProps) {
  const { width, height, color, ...rest } = base(props);
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...rest}>
      <Circle cx="12" cy="8" r="3.5" stroke={color} strokeWidth="1.8" />
      <Path
        d="M5.5 19.5c1.6-3.2 4-4.8 6.5-4.8s4.9 1.6 6.5 4.8"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function SettingsIcon(props: IconProps) {
  const { width, height, color, ...rest } = base(props);
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...rest}>
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.8" />
      <Path
        d="M19.4 13.1c.05-.36.1-.72.1-1.1s-.05-.74-.1-1.1l2.05-1.6a.5.5 0 0 0 .12-.63l-1.95-3.37a.5.5 0 0 0-.6-.22l-2.42.97a7.3 7.3 0 0 0-1.9-1.1l-.36-2.57A.5.5 0 0 0 13.9 2h-3.8a.5.5 0 0 0-.5.43l-.36 2.57c-.68.27-1.32.63-1.9 1.1l-2.42-.97a.5.5 0 0 0-.6.22L2.37 8.72a.5.5 0 0 0 .12.63L4.54 10.95c-.05.36-.1.72-.1 1.1s.05.74.1 1.1L2.49 14.75a.5.5 0 0 0-.12.63l1.95 3.37c.13.23.4.32.6.22l2.42-.97c.58.47 1.22.83 1.9 1.1l.36 2.57c.05.25.26.43.5.43h3.8c.24 0 .45-.18.5-.43l.36-2.57c.68-.27 1.32-.63 1.9-1.1l2.42.97c.23.1.48 0 .6-.22l1.95-3.37a.5.5 0 0 0-.12-.63L19.4 13.1Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  const { width, height, color, ...rest } = base(props);
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...rest}>
      <Path
        d="m9 6 6 6-6 6"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  const { width, height, color, ...rest } = base(props);
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...rest}>
      <Path
        d="m15 6-6 6 6 6"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function UploadIcon(props: IconProps) {
  const { width, height, color, ...rest } = base(props);
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...rest}>
      <Path d="M12 15.5V5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Path
        d="m8 8.5 4-4 4 4"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5 16.5v2A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-2"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function FolderPlusIcon(props: IconProps) {
  const { width, height, color, ...rest } = base(props);
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...rest}>
      <Path
        d="M3.5 8.2A2.2 2.2 0 0 1 5.7 6h3.8l1.5 1.7h5.3A2.2 2.2 0 0 1 18.5 9.9v1.1"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3.5 8.5v8.8A2.2 2.2 0 0 0 5.7 19.5h5.1"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <Path d="M16.5 13.5v6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Path d="M13.5 16.5h6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

export function ImageIcon(props: IconProps) {
  const { width, height, color, ...rest } = base(props);
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...rest}>
      <Rect x="3.5" y="4.5" width="17" height="15" rx="2.2" stroke={color} strokeWidth="1.8" />
      <Circle cx="9" cy="9.5" r="1.6" stroke={color} strokeWidth="1.6" />
      <Path
        d="m4.5 16.5 4.2-4.2 3.3 3.3 3-3 4.5 4.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function PdfIcon(props: IconProps) {
  const { width, height, color, ...rest } = base(props);
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...rest}>
      <Path
        d="M8 4.5h5.2L18 9.3V18.5A1.5 1.5 0 0 1 16.5 20H8A1.5 1.5 0 0 1 6.5 18.5v-12A2 2 0 0 1 8 4.5Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <Path d="M13 4.5V9h4.8" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      <Path d="M9 14h6M9 16.5h4" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  );
}

export function DocIcon(props: IconProps) {
  const { width, height, color, ...rest } = base(props);
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...rest}>
      <Path
        d="M8 4.5h5.2L18 9.3V18.5A1.5 1.5 0 0 1 16.5 20H8A1.5 1.5 0 0 1 6.5 18.5v-12A2 2 0 0 1 8 4.5Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <Path d="M13 4.5V9h4.8" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      <Path d="M9 13h6M9 15.5h6M9 18h3.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  );
}

export function ServerIcon(props: IconProps) {
  const { width, height, color, ...rest } = base(props);
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...rest}>
      <Rect x="3.5" y="4" width="17" height="6" rx="2" stroke={color} strokeWidth="1.8" />
      <Rect x="3.5" y="14" width="17" height="6" rx="2" stroke={color} strokeWidth="1.8" />
      <Circle cx="8" cy="7" r="1" fill={color} />
      <Circle cx="8" cy="17" r="1" fill={color} />
    </Svg>
  );
}

export function HardDriveIcon(props: IconProps) {
  const { width, height, color, ...rest } = base(props);
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...rest}>
      <Path
        d="M4 16.5V8.8C4 7.25 5.25 6 6.8 6h10.4C18.75 6 20 7.25 20 8.8v7.7c0 1.55-1.25 2.8-2.8 2.8H6.8C5.25 19.3 4 18.05 4 16.5Z"
        stroke={color}
        strokeWidth="1.8"
      />
      <Path d="M4 14h16" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Circle cx="16.5" cy="16.5" r="1" fill={color} />
    </Svg>
  );
}

export function LockIcon(props: IconProps) {
  const { width, height, color, ...rest } = base(props);
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...rest}>
      <Rect x="5" y="10.5" width="14" height="9.5" rx="2.2" stroke={color} strokeWidth="1.8" />
      <Path
        d="M8.2 10.5V8.2a3.8 3.8 0 0 1 7.6 0v2.3"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <Circle cx="12" cy="15.2" r="1.15" fill={color} />
    </Svg>
  );
}

export function LogoutIcon(props: IconProps) {
  const { width, height, color, ...rest } = base(props);
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...rest}>
      <Path
        d="M10 5.5H7.8A2.8 2.8 0 0 0 5 8.3v7.4A2.8 2.8 0 0 0 7.8 18.5H10"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <Path d="M10.5 12H20" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Path
        d="M16.5 8.5 20 12l-3.5 3.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CheckCircleIcon(props: IconProps) {
  const { width, height, color, ...rest } = base(props);
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...rest}>
      <Circle cx="12" cy="12" r="8.25" stroke={color} strokeWidth="1.8" />
      <Path
        d="m8.5 12.2 2.3 2.3 4.7-4.8"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function AlertCircleIcon(props: IconProps) {
  const { width, height, color, ...rest } = base(props);
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...rest}>
      <Circle cx="12" cy="12" r="8.25" stroke={color} strokeWidth="1.8" />
      <Path d="M12 8v5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Circle cx="12" cy="16.2" r="1" fill={color} />
    </Svg>
  );
}

export function ShieldIcon(props: IconProps) {
  const { width, height, color, ...rest } = base(props);
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...rest}>
      <Path
        d="M12 3.5 19 6.5v5.2c0 4.3-2.9 7.5-7 8.8-4.1-1.3-7-4.5-7-8.8V6.5L12 3.5Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ClockIcon(props: IconProps) {
  const { width, height, color, ...rest } = base(props);
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...rest}>
      <Circle cx="12" cy="12" r="8.25" stroke={color} strokeWidth="1.8" />
      <Path d="M12 7.5V12l3 2" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

/** Pick a file-type icon for lists and filters. */
export function fileTypeIcon(type?: string | null) {
  const t = (type ?? '').toLowerCase();
  if (t === 'image' || t === 'images') return ImageIcon;
  if (t === 'pdf' || t === 'pdfs') return PdfIcon;
  if (t === 'doc' || t === 'docs' || t === 'document') return DocIcon;
  return FilesIcon;
}
