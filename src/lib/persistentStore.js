import { writable } from 'svelte/store'

const defaultSettings = JSON.stringify({
  deviceId: ''
})

export const settings = writable(JSON.parse(localStorage.getItem('settings') || defaultSettings))
export function resetSettings(obj) {settings.set(obj || JSON.parse(defaultSettings))}

settings.subscribe((value) => (localStorage.settings = JSON.stringify(value)))
