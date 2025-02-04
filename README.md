# Input Devices

A small Svelte component to select an input audio device from those connected. Uses Storybook for Component Tests.

This component is a little unusual as its state is not fully defined by its props but rather by the browser MediaDevices API and localStorage.

It's a real component but also used to "Kick the tyres" of storybooks new COmponent Tests and addon-svelte-csf. Result is storybook is very useful. Several bugs surfaced in writing the tests.

Uses browser:

- MediaDevices
- LocalStorage

Tools:

- Svelte 5
- TypeScript
- vite
- story book
  - Component tests with experimental test addon (vitetest browser mode with Playwright Chromium)
  - addon-svelte-csf for easier Svelte Stories
  - play function using expect etc

Main scripts:

- npm run dev
- npm run storybook

Misc:

[Issues](https://github.com/SteveALee/input-devices/issues)
