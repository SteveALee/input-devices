<script lang="ts">
  import { settings } from '@lib/persistentStore.js'
  import { compileModule } from 'svelte/compiler'

  interface Props {
    ondeviceid: (deviceId: string) => void
  }
  let { ondeviceid }: Props = $props()

  let deviceId = $state($settings.deviceId == '' ? undefined : $settings.deviceId)
  let devicesPromise = $state.raw(getInputDevices())

  $effect(() => {
    deviceId // ensure it's tracked
    devicesPromise
      .then((devices) => {
        if (!devices.find((d) => d.deviceId === deviceId)) {
          deviceId = 'unknown'
        }
        return deviceId
      })
      .then((devId) => {
        ondeviceid(devId) // passed up, not stored in settings
      })
  })

  $effect(() => {
    if (deviceId && deviceId != 'unknown') {
      // don't store unknown incase stored device is reconnected
      $settings.deviceId = deviceId
    }
  })

  async function getInputDevices() {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true }) // prompt user for access
      const devices = await navigator.mediaDevices.enumerateDevices()

      return devices
        .filter(
          (device) =>
            device.kind === 'audioinput' &&
            device.deviceId !== 'default' &&
            device.deviceId !== 'communications'
        )
        .map((device) => ({
          label: device.label,
          deviceId: device.deviceId
        }))
    } catch (err) {
      console.log({ err })
      return []
    }
  }

  navigator.mediaDevices.ondevicechange = () => {
    devicesPromise = getInputDevices()
  }
</script>

{#await devicesPromise then devices}
  {#if devices.length == 0}
    <div>No input devices found</div>
  {:else}
    <label
      >Input: <select disabled={devices.length == 1 && deviceId != 'unknown'} bind:value={deviceId}>
        {#if deviceId == 'unknown'}
          <option value="unknown">Previous Not Found</option>
        {/if}
        {#each devices as device}
          <option value={device.deviceId}>{device.label.slice(0, 30)}</option>
        {/each}
      </select>
    </label>
  {/if}
{/await}

<style>
</style>
