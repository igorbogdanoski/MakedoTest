export function triggerOnEnterOrSpace(event, callback) {
  if (!event || typeof callback !== 'function') return;
  if (event.key === 'Enter' || event.key === ' ') {
    if (typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    callback();
  }
}
