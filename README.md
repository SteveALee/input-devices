# Input Devices

A small Svelte component to select an input audio device from those connected. Uses Storybook for Component Tests.

This component is a little unusual as its state is not fully defined by its props but rather by the browser media Devices API.

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
