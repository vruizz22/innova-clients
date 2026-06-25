// SuperProfes shared UI components
// All components follow strict TypeScript + Tailwind CSS conventions

export { Logo } from './components/Logo';
export { Dropzone } from './components/Dropzone';
export { Button } from './components/Button';
export { Card } from './components/Card';
export { Badge } from './components/Badge';
export { Input } from './components/Input';
export { MasteryBar } from './components/MasteryBar';
export { MasteryCell } from './components/MasteryCell';
export { AlertCard } from './components/AlertCard';

export { EmptyState, type EmptyStateProps, type EmptyStateKind } from './components/EmptyState';
export { Toaster } from './components/Toaster';
export { toast } from 'sonner';
export { Sheet, type SheetProps } from './components/Sheet';

// v8 components — multi-grade teacher, exercise bank, error catalog
export { GradeBandSelector } from './components/GradeBandSelector';
export { ErrorTagChip } from './components/ErrorTagChip';
export { ExerciseCard, type ExerciseCardData } from './components/ExerciseCard';
export { ErrorSearchTypeahead } from './components/ErrorSearchTypeahead';
export { ImageLightbox, type ImageLightboxProps } from './components/ImageLightbox';
export { MathField, type MathFieldProps } from './components/MathField';
export { StatCard, type StatCardProps } from './components/StatCard';
export {
  HeatmapCollapsedByUnit,
  type HeatmapUnit,
  type HeatmapStudentRow,
} from './components/HeatmapCollapsedByUnit';

// Brand icons — stroke-based, currentColor, 24x24 viewBox
export {
  BellIcon,
  CameraIcon,
  BookOpenIcon,
  BarChart3Icon,
  AlertTriangleIcon,
  TrendingDownIcon,
  UsersIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  SearchIcon,
  SettingsIcon,
  MenuIcon,
  XIcon,
  LockIcon,
  FileIcon,
  CheckIcon,
  ShieldIcon,
  CircleIcon,
  ClockIcon,
  PencilIcon,
  UploadIcon,
  ImageIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  PlusIcon,
  LoaderIcon,
} from './icons';
