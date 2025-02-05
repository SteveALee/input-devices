# Input Devices

A small Svelte component to select an input audio device from all those connected, passing the devicecid. Uses Storybook for Component Tests.

This component is a little unusual as its state is not fully defined by props but rather by the browser MediaDevices API and localStorage.

It's a real component for a web audio recorder project but also used to "Kick the tyres" of Storybook's new Component Tests and addon-svelte-csf. Result is storybook is very useful indeed. test components out of context amd with stories allows for a thorough evaluation. Several bugs surfaced in writing the tests.

Uses browser:

- MediaDevices
- LocalStorage

Tools:

- Svelte 5
- TypeScript
- Vite
- Storybook
  - Component tests with experimental test addon (vitetest browser mode with Playwright)
  - addon-svelte-csf for easier Svelte Stories
  - play function using expect etc

Main package.json scripts:

- dev
- storybook

Misc:

[Issues](https://github.com/SteveALee/input-devices/issues)
