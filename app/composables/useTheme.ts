export type Theme = "light" | "dark";

const THEME_KEY = "theme";

function reflect(value: Theme) {
  const root = document.documentElement;
  root.dataset.theme = value;
  root.classList.toggle("dark", value === "dark");

  // Fill <meta name="theme-color"> with the computed background colour so
  // Android's browser chrome matches the page background.
  const bg = window.getComputedStyle(document.body).backgroundColor;
  document
    .querySelector("meta[name='theme-color']")
    ?.setAttribute("content", bg);
}

export function useTheme() {
  const theme = useState<Theme>("theme", () => "light");

  function apply(value: Theme, persist = true) {
    theme.value = value;
    reflect(value);
    if (persist) localStorage.setItem(THEME_KEY, value);
  }

  function toggle() {
    apply(theme.value === "light" ? "dark" : "light");
  }

  return { theme, toggle, apply };
}
