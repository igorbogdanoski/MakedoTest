export function setTemporaryState(setter, value, durationMs, resetValue = null) {
  if (typeof setter !== 'function') return () => {};
  setter(value);
  const handle = setTimeout(() => setter(resetValue), durationMs);
  return () => clearTimeout(handle);
}
