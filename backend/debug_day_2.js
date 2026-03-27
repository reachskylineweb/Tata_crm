function dowOf(ymd) {
  // Try it with Z
  const dZ = new Date(ymd + 'T00:00:00Z');
  // Try it without Z
  const dL = new Date(ymd);

  return {
    withZ: dZ.getUTCDay(),
    withZ_ISO: dZ.toISOString(),
    local: dL.getDay(),
    local_ISO: dL.toISOString(),
    local_UTC: dL.getUTCDay()
  };
}

console.log('Today:', '2026-03-20');
console.table([dowOf('2026-03-20')]);
