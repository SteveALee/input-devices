<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import { within, waitFor, expect, fn, spyOn, userEvent } from '@storybook/test'

  import { resetSettings, settings } from '@lib/persistentStore.js'
  import InputDevices from '@components/InputDevices.svelte'

  interface MockedMediaDeviceInfo extends Omit<MediaDeviceInfo, 'kind' | 'groupId' | 'toJSON'> {}

  const { Story } = defineMeta({
    title: 'InputDevices',
    component: InputDevices,
    tags: ['_autodocs'],
    argTypes: {},
    args: {
      ondeviceid: fn()
    },
    async beforeEach(ctx) {
      // Need here as <script> scope is in different browser context

      await navigator.mediaDevices.getUserMedia({ audio: true })

      // the settings stores is a writable that persists to local storage
      // except it's not Playwright's Chomeium but the host browser (assuming not CLI runner)
      // This is probably a bug but we work with it by using the export resetSettings
      // Note also %settings doesn't work here so we would use settings.subscribe()
      const reset = ctx.parameters.resetSettings
      if (reset === true) {
        resetSettings()
      } else if (reset !== false) {
        resetSettings({ deviceId: reset })
      }

      const mediaDevices = ctx.parameters.deviceDefs.map(
        (d: MockedMediaDeviceInfo) =>
          ({ ...d, kind: 'audioinput', groupId: '', toJSON: () => {} }) as MediaDeviceInfo
      )

      // Can't seem to hoist this to enclosure so run here for every Story
      // Not sure when is destroyed
      const enumDevicesSpy = spyOn(navigator.mediaDevices, 'enumerateDevices')
      enumDevicesSpy.mockImplementation(() => Promise.resolve(mediaDevices))
    }
  })
</script>

<Story
  name="Single Device none Saved"
  parameters={{
    resetSettings: true,
    deviceDefs: [{ deviceId: 'one', label: 'Input Device' }]
  }}
  play={async ({ args, parameters, canvasElement }) => {
    expect(await navigator.mediaDevices.enumerateDevices()).toHaveLength(1)
    await waitFor(() => {
      expect(args.ondeviceid).toHaveBeenCalledWith(parameters.deviceDefs[0].deviceId)
    })

    const canvas = within(canvasElement)
    const devices = canvas.getByRole('combobox', { name: 'Input:' })
    expect(devices).toHaveValue(parameters.deviceDefs[0].deviceId)
    expect(devices).toBeDisabled()
  }}
></Story>

<Story
  name="Single Device Saved"
  parameters={{
    resetSettings: 'one',
    deviceDefs: [{ deviceId: 'one', label: 'Input Device' }]
  }}
  play={async ({ args, parameters, canvasElement }) => {
    expect(await navigator.mediaDevices.enumerateDevices()).toHaveLength(1)
    await waitFor(() => {
      expect(args.ondeviceid).toHaveBeenCalledWith(parameters.deviceDefs[0].deviceId)
    })

    const canvas = within(canvasElement)
    const devices = canvas.getByRole('combobox', { name: 'Input:' })
    expect(devices).toHaveValue(parameters.deviceDefs[0].deviceId)
    expect(devices).toBeDisabled()
  }}
></Story>

<Story
  name="Single Device Another Saved"
  parameters={{
    resetSettings: 'random',
    deviceDefs: [{ deviceId: 'one', label: 'Input Device' }]
  }}
  play={async ({ args, parameters, canvasElement }) => {
    expect(await navigator.mediaDevices.enumerateDevices()).toHaveLength(1)
    await waitFor(() => {
      expect(args.ondeviceid).toHaveBeenCalledWith('unknown')
    })

    function getOptionValues(optionEl: HTMLSelectElement) {
      return [...optionEl.options].map((o) => o.value)
    }

    const canvas = within(canvasElement)
    const devices = canvas.getByRole('combobox', { name: 'Input:' })
    expect(devices).toHaveValue('unknown')
    expect(devices).toBeEnabled()
    expect(getOptionValues(devices as HTMLSelectElement)).toEqual(['unknown', 'one'])
    await userEvent.selectOptions(devices, 'one')
    expect(devices).toHaveValue('one')
    expect(devices).toBeDisabled()
  }}
></Story>

<Story
  name="Multiple Devices OneSaved"
  parameters={{
    resetSettings: 'two',
    deviceDefs: [
      { deviceId: 'one', label: 'Input Device 1' },
      { deviceId: 'two', label: 'Input Device 2' },
      { deviceId: 'three', label: 'Input Device 3' }
    ]
  }}
  play={async ({ args, parameters, canvasElement }) => {
    expect(await navigator.mediaDevices.enumerateDevices()).toHaveLength(3)
    await waitFor(() => {
      expect(args.ondeviceid).toHaveBeenCalledWith(parameters.deviceDefs[1].deviceId)
    })

    const canvas = within(canvasElement)
    const devices = canvas.getByRole('combobox', { name: 'Input:' })
    expect(devices).toHaveValue(parameters.deviceDefs[1].deviceId)
    expect(devices).toBeEnabled()
    await userEvent.selectOptions(devices, 'three')
    expect(devices).toHaveValue('three')
    expect($settings.deviceId).toBe('three') // Can use $ to subscribe here
  }}
></Story>
