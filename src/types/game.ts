export type GameState =
  | 'MENU'
  | 'PLAYING'
  | 'PAUSED'
  | 'INVENTORY'
  | 'PUZZLE'
  | 'NOTE_INSPECT'
  | 'GAME_OVER'
  | 'VICTORY';

export type GraphicsPreset = 'low' | 'medium' | 'high' | 'ultra';

export interface GraphicsSettings {
  preset: GraphicsPreset;
  fpsCap: 30 | 60;
  shadows: boolean;
  renderScale: number;
  filmGrain: boolean;
  vignette: boolean;
  particles: boolean;
}

export interface ControlSettings {
  touchSensitivity: number;
  invertY: boolean;
  hapticsEnabled: boolean;
  joystickDynamic: boolean;
}

export interface AudioSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: 'key' | 'tool' | 'document' | 'battery' | 'tape';
  icon: string;
  content?: string;
}

export interface Objective {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface PlayerStats {
  health: number;
  stamina: number;
  sanity: number;
  flashlightOn: boolean;
  battery: number;
  isCrouching: boolean;
  isSprinting: boolean;
  isHiding: boolean;
}

export interface InteractiveTarget {
  id: string;
  type: 'door' | 'key' | 'note' | 'battery' | 'breaker' | 'keypad' | 'locker' | 'ambulance' | 'radio';
  label: string;
  actionText: string;
  distance: number;
  locked?: boolean;
  requiresItem?: string;
  data?: any;
}

export interface ChapterInfo {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  status: 'available' | 'locked';
  difficulty: 'Normal' | 'Hard' | 'Nightmare';
  location: string;
}
