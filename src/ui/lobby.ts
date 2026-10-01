import { listRooms } from '../domain/catalog';
import type { Navigation } from '../domain/navigation';
import type { ContentCatalog, Room } from '../domain/types';

function createDoor(room: Room, onSelect: (room: Room) => void): HTMLLIElement {
  const item = document.createElement('li');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'door';
  button.dataset.roomId = room.id;
  button.dataset.status = room.status;
  if (room.status === 'upcoming') button.setAttribute('aria-disabled', 'true');

  const frame = document.createElement('span');
  frame.className = 'door__frame';
  frame.setAttribute('aria-hidden', 'true');
  frame.innerHTML = '<span class="door__light"></span><span class="door__leaf"><span class="door__knob"></span></span>';

  const name = document.createElement('span');
  name.className = 'door__name';
  name.textContent = room.name;

  const description = document.createElement('span');
  description.className = 'door__description';
  description.textContent = room.description;

  button.append(frame, name, description);

  if (room.status === 'upcoming') {
    const badge = document.createElement('span');
    badge.className = 'door__badge';
    badge.textContent = 'Próximamente';
    button.append(badge);
  }

  button.addEventListener('click', () => onSelect(room));
  item.append(button);
  return item;
}

/** Lobby: una puerta por sala. Las salas "upcoming" muestran un aviso en lugar de navegar. */
export function renderLobby(catalog: ContentCatalog, navigation: Navigation): HTMLElement {
  const section = document.createElement('section');
  section.className = 'lobby';
  section.setAttribute('aria-labelledby', 'lobby-title');

  const header = document.createElement('header');
  header.className = 'lobby__header';
  header.innerHTML = `
    <h1 id="lobby-title" class="lobby__title">Torre AWS</h1>
    <p class="lobby__subtitle">Elige una sala para estudiar los servicios de AWS del examen Solutions Architect – Associate.</p>
  `;

  const notice = document.createElement('p');
  notice.className = 'lobby__notice';
  notice.setAttribute('role', 'status');

  const doors = document.createElement('ul');
  doors.className = 'lobby__doors';
  for (const room of listRooms(catalog)) {
    doors.append(
      createDoor(room, (selected) => {
        const result = navigation.enterRoom(selected.id);
        if (!result.ok && result.reason === 'upcoming') {
          notice.textContent = `${selected.name} estará disponible próximamente.`;
        }
      }),
    );
  }

  section.append(header, doors, notice);
  return section;
}
