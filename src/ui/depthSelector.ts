import type { DepthLevel } from '../domain/types';

const LEVEL_LABELS: Record<DepthLevel, string> = {
  normal: 'Normal',
  deep: 'Profundo',
};

export interface DepthSelector {
  element: HTMLElement;
  setLevel: (level: DepthLevel) => void;
}

/** Selector Normal / Profundo. Indica el nivel activo con aria-pressed. */
export function renderDepthSelector(
  level: DepthLevel,
  onChange: (level: DepthLevel) => void,
): DepthSelector {
  const group = document.createElement('div');
  group.className = 'depth-selector';
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', 'Nivel de profundidad');

  const buttons = new Map<DepthLevel, HTMLButtonElement>();
  for (const option of Object.keys(LEVEL_LABELS) as DepthLevel[]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'depth-selector__button';
    button.textContent = LEVEL_LABELS[option];
    button.addEventListener('click', () => onChange(option));
    buttons.set(option, button);
    group.append(button);
  }

  function setLevel(active: DepthLevel): void {
    for (const [option, button] of buttons) {
      button.setAttribute('aria-pressed', String(option === active));
    }
  }

  setLevel(level);
  return { element: group, setLevel };
}
