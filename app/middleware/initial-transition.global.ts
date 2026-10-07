import { withoutTrailingSlash } from "ufo";

export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.client && (useNuxtApp().isHydrating || withoutTrailingSlash(to.path) === withoutTrailingSlash(from.path))) {
    to.meta.viewTransition = false;
  }
});
