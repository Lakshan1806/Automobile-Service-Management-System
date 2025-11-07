export function parseCustomerId(raw) {
  const value = Number.parseInt(raw, 10);
  if (Number.isNaN(value)) {
    return null;
  }
  return value;
}

