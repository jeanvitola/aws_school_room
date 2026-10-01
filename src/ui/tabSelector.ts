export interface TabSelector<T extends string> {
  element: HTMLElement;
  setActive: (tab: T) => void;
}

/**
 * Grupo de botones excluyentes (pestañas de la ficha o nivel del modo texto).
 * Indica la opción activa con aria-pressed.
 */
export function renderTabSelector<T extends string>(
  label: string,
  tabs: [T, string][],
  active: T,
  onChange: (tab: T) => void,
): TabSelector<T> {
  const group = document.createElement('div');
  group.className = 'tab-selector';
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', label);

  const buttons = new Map<T, HTMLButtonElement>();
  for (const [tab, text] of tabs) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tab-selector__button';
    button.textContent = text;
    button.addEventListener('click', () => onChange(tab));
    buttons.set(tab, button);
    group.append(button);
  }

  function setActive(current: T): void {
    for (const [tab, button] of buttons) {
      button.setAttribute('aria-pressed', String(tab === current));
    }
  }

  setActive(active);
  return { element: group, setActive };
}
