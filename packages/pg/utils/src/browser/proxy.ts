export function proxyRow(row: any) {
  if (row.username && row.password) {
    return `${row.proxyType}://${row.username}:${row.password}@${row.host}:${row.port}`;
  }
  return `${row.proxyType}://${row.host}:${row.port}`;
}
