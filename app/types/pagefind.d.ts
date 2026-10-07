declare module "@pagefind/default-ui" {
  interface Result { url: string; sub_results?: { url: string }[] }
  export class PagefindUI {
    constructor(options: { element: string; bundlePath: string; showImages: boolean; showSubResults: boolean; processResult: (result: Result) => Result; processTerm: (term: string) => string });
    triggerSearch(term: string): void;
    destroy(): void;
  }
}
