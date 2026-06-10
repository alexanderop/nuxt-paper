<template>
  <div class="flex min-h-svh flex-col">
    <AppHeader />
    <!--
      The wrapper grows to fill the viewport so the footer sits at the
      bottom and `mt-auto` children (e.g. PaginationNav) stick above it.
    -->
    <div class="flex flex-1 flex-col">
      <slot />
    </div>
    <AppFooter />
  </div>
</template>
