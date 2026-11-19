import { signal } from '@preact/signals-react';
import type { PersonaOption } from './types';

// ─── Option / Load Signals ───────────────────────────────────────────────────
export const menuRolesOptionsSignal = signal<PersonaOption[]>([]);
export const menuRolesOptionsIsLoadingSignal = signal<boolean>(false);
