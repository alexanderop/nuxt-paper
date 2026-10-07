export function cardTransitionStyles(name: string): string {
  return `::view-transition-old(${name}) { animation: paperFadeOut 180ms cubic-bezier(0.76, 0, 0.24, 1) both; }
    ::view-transition-new(${name}) { animation: paperFadeIn 180ms cubic-bezier(0.76, 0, 0.24, 1) both; }`;
}
