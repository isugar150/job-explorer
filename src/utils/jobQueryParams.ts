export function getQueryJobId(): string | null {
  return new URLSearchParams(window.location.search).get('job');
}

export function hasQueryJobId(): boolean {
  return new URLSearchParams(window.location.search).has('job');
}

export function setQueryJobId(jobId: string): void {
  const params = new URLSearchParams(window.location.search);
  params.set('job', jobId);
  window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
}

export function clearQueryJobId(): void {
  const params = new URLSearchParams(window.location.search);
  params.delete('job');
  const nextUrl = params.toString()
    ? `${window.location.pathname}?${params.toString()}`
    : window.location.pathname;

  window.history.replaceState(null, '', nextUrl);
}
