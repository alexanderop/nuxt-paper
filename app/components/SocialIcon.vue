<script setup lang="ts">
import type { Component } from "vue";
import SocialFacebook from "./icons/SocialFacebook.vue";
import SocialGithub from "./icons/SocialGithub.vue";
import SocialLinkedin from "./icons/SocialLinkedin.vue";
import SocialMail from "./icons/SocialMail.vue";
import SocialPinterest from "./icons/SocialPinterest.vue";
import SocialTelegram from "./icons/SocialTelegram.vue";
import SocialWhatsapp from "./icons/SocialWhatsapp.vue";
import SocialX from "./icons/SocialX.vue";

const icons: Record<string, Component> = {
  facebook: SocialFacebook,
  github: SocialGithub,
  linkedin: SocialLinkedin,
  mail: SocialMail,
  pinterest: SocialPinterest,
  telegram: SocialTelegram,
  whatsapp: SocialWhatsapp,
  x: SocialX,
};

defineProps<{ name: string }>();
</script>

<template>
  <component :is="icons[name]" v-if="icons[name]" />
</template>
