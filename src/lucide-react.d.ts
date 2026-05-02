/**
 * Type shim for lucide-react.
 * The installed version ships with an empty `exports` field which breaks
 * TypeScript's `moduleResolution: bundler`. This declaration file lets
 * the compiler resolve all imports from "lucide-react" without modifying
 * node_modules (which would not survive a fresh install on Vercel).
 */
declare module "lucide-react" {
  import type { FC, SVGProps } from "react";

  export interface LucideProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    strokeWidth?: number | string;
    absoluteStrokeWidth?: boolean;
    className?: string;
  }

  export type LucideIcon = FC<LucideProps>;

  // Navigation / UI
  export const ArrowLeft: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const Menu: LucideIcon;
  export const X: LucideIcon;

  // Actions
  export const Plus: LucideIcon;
  export const Pencil: LucideIcon;
  export const Trash2: LucideIcon;
  export const Edit: LucideIcon;
  export const Edit2: LucideIcon;
  export const Save: LucideIcon;
  export const Upload: LucideIcon;
  export const Download: LucideIcon;
  export const Search: LucideIcon;

  // Auth / Account
  export const Lock: LucideIcon;
  export const Unlock: LucideIcon;
  export const LogIn: LucideIcon;
  export const LogOut: LucideIcon;
  export const User: LucideIcon;
  export const Users: LucideIcon;
  export const Shield: LucideIcon;
  export const Key: LucideIcon;

  // Theme
  export const Sun: LucideIcon;
  export const Moon: LucideIcon;

  // Contact / Social
  export const Mail: LucideIcon;
  export const Phone: LucideIcon;
  export const MessageCircle: LucideIcon;
  export const MessageSquare: LucideIcon;
  export const Github: LucideIcon;
  export const Linkedin: LucideIcon;
  export const Instagram: LucideIcon;
  export const Twitter: LucideIcon;
  export const Globe: LucideIcon;
  export const Link: LucideIcon;
  export const ExternalLink: LucideIcon;

  // Status / Indicators
  export const Check: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const Info: LucideIcon;
  export const Loader: LucideIcon;
  export const Loader2: LucideIcon;

  // Media / Files
  export const Image: LucideIcon;
  export const ImagePlus: LucideIcon;
  export const File: LucideIcon;
  export const Folder: LucideIcon;
  export const FolderOpen: LucideIcon;

  // Misc
  export const Settings: LucideIcon;
  export const Star: LucideIcon;
  export const Heart: LucideIcon;
  export const Eye: LucideIcon;
  export const EyeOff: LucideIcon;
  export const Code: LucideIcon;
  export const Code2: LucideIcon;
  export const Cpu: LucideIcon;
  export const Database: LucideIcon;
  export const Server: LucideIcon;
  export const Cloud: LucideIcon;
  export const Smartphone: LucideIcon;
  export const Monitor: LucideIcon;
  export const Laptop: LucideIcon;
  export const Wifi: LucideIcon;
  export const Zap: LucideIcon;
  export const Building: LucideIcon;
  export const Building2: LucideIcon;
  export const MapPin: LucideIcon;
  export const Calendar: LucideIcon;
  export const Clock: LucideIcon;
  export const Tag: LucideIcon;
  export const Layers: LucideIcon;
}
