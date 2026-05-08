const SIDEBAR_CONTAINER_OPEN = 'w-80 opacity-100';
const SIDEBAR_CONTAINER_CLOSED = 'w-0 opacity-0 pointer-events-none';

const SIDEBAR_CONTENT_OPEN = 'block';
const SIDEBAR_CONTENT_CLOSED = 'hidden';

export function getSidebarContainerClass(isOpen) {
  return isOpen ? SIDEBAR_CONTAINER_OPEN : SIDEBAR_CONTAINER_CLOSED;
}

export function getSidebarContentClass(isOpen) {
  return isOpen ? SIDEBAR_CONTENT_OPEN : SIDEBAR_CONTENT_CLOSED;
}
