<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import { within, waitFor, expect, fn, spyOn, userEvent } from '@storybook/test'

  import { resetSettings, settings } from '@lib/persistentStore.js' // TODO: this is saving in host browser not chromium
  import InputDevices from '@components/InputDevices.svelte'

  interface DeviceDef extends Omit<MediaDeviceInfo, 'kind' | 'groupId' | 'toJSON'> {}

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
      // except it's not Playwright's Chromeium but the host browser (assuming not CLI runner)
      // This is probably a bug but we work with it by using the export resetSettings
      // Note also %settings doesn't work here so we would use settings.subscribe()
      const reset = ctx.parameters.resetSettings
      if (reset === true) {
        resetSettings()
      } else if (reset !== false) {
        resetSettings({ deviceId: reset })
      }

      if (ctx.parameters.deviceDefs) {
        const mediaDevices = ctx.parameters.deviceDefs.map(
          (d: DeviceDef) =>
            ({ ...d, kind: 'audioinput', groupId: '', toJSON: () => {} }) as MediaDeviceInfo
        )

        // Can't seem to hoist this to enclosure so run here for every Story
        // Not sure when is destroyed
        // I'm confused as this should run in host browser yet asserts in play work
        const enumDevicesSpy = spyOn(navigator.mediaDevices, 'enumerateDevices')
        enumDevicesSpy.mockImplementation(() => Promise.resolve(mediaDevices))
      }
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
    await waitFor(() => {
      expect(args.ondeviceid).toHaveBeenCalledWith(parameters.deviceDefs[0].deviceId)
    })

    const canvas = within(canvasElement)
    const devices = canvas.getByRole('combobox', { name: 'Input:' }) as HTMLSelectElement
    expect([...devices.options].map((o) => o.value)).toEqual(
      parameters.deviceDefs.map((d) => d.deviceId)
    )
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
    await waitFor(() => {
      expect(args.ondeviceid).toHaveBeenCalledWith(parameters.deviceDefs[0].deviceId)
    })

    const canvas = within(canvasElement)
    const devices = canvas.getByRole('combobox', { name: 'Input:' }) as HTMLSelectElement
    expect([...devices.options].map((o) => o.value)).toEqual(
      parameters.deviceDefs.map((d) => d.deviceId)
    )
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
    await waitFor(() => {
      expect(args.ondeviceid).toHaveBeenCalledWith('unknown')
    })

    function getOptionValues(optionEl: HTMLSelectElement) {
      return [...optionEl.options].map((o) => o.value)
    }

    const canvas = within(canvasElement)
    const devices = canvas.getByRole('combobox', { name: 'Input:' }) as HTMLSelectElement
    expect([...devices.options].map((o) => o.value)).toEqual(
      parameters.deviceDefs.map((d) => d.deviceId)
    )
    expect(devices).toHaveValue('unknown')
    expect(devices).toBeEnabled()
    expect(getOptionValues(devices as HTMLSelectElement)).toEqual(['unknown', 'one'])
    await userEvent.selectOptions(devices, 'one')
    expect(devices).toHaveValue('one')
    expect(devices).toBeDisabled()
  }}
></Story>

<Story
  name="Multiple Devices One Saved"
  parameters={{
    resetSettings: 'two',
    deviceDefs: [
      { deviceId: 'one', label: 'Input Device 1' },
      { deviceId: 'two', label: 'Input Device 2' },
      { deviceId: 'three', label: 'Input Device 3' }
    ]
  }}
  play={async ({ args, parameters, canvasElement }) => {
    await waitFor(() => {
      expect(args.ondeviceid).toHaveBeenCalledWith(parameters.deviceDefs[1].deviceId)
    })

    const canvas = within(canvasElement)
    const devices = canvas.getByRole('combobox', { name: 'Input:' }) as HTMLSelectElement
    expect([...devices.options].map((o) => o.value)).toEqual(
      parameters.deviceDefs.map((d) => d.deviceId)
    )
    expect(devices).toHaveValue(parameters.deviceDefs[1].deviceId)
    expect(devices).toBeEnabled()
    await userEvent.selectOptions(devices, 'three')
    expect(devices).toHaveValue('three')
    expect($settings.deviceId).toBe('three') // Can use $ to subscribe here
  }}
></Story>

<Story
  name="Is Reactive"
  parameters={{
    resetSettings: 'two'
  }}
  play={async ({ args, parameters, canvasElement }) => {
    const deviceDefs = [
      { deviceId: 'one', label: 'Input Device 1' },
      { deviceId: 'two', label: 'Input Device 2' },
      { deviceId: 'three', label: 'Input Device 3' }
    ]
    const deviceDefs2 = [...deviceDefs, { deviceId: 'four', label: 'Input Device 4' }]

    function expandDeviceDefs(deviceDefs: DeviceDef[]) {
      return deviceDefs.map(
        (d) => ({ ...d, kind: 'audioinput', groupId: '', toJSON: () => {} }) as MediaDeviceInfo
      )
    }
    const enumDevicesSpy = spyOn(navigator.mediaDevices, 'enumerateDevices')
    enumDevicesSpy.mockImplementation(() => Promise.resolve(expandDeviceDefs(deviceDefs)))

    await waitFor(() => {
      expect(args.ondeviceid).toHaveBeenCalledWith(deviceDefs[1].deviceId)
    })

    const canvas = within(canvasElement)
    const devices = canvas.getByRole('combobox', { name: 'Input:' }) as HTMLSelectElement
    expect([...devices.options].map((o) => o.value)).toEqual(deviceDefs.map((d) => d.deviceId))
    expect(devices).toHaveValue(deviceDefs[1].deviceId)
    expect(devices).toBeEnabled()
    await userEvent.selectOptions(devices, 'three')
    expect(devices).toHaveValue('three')
    expect($settings.deviceId).toBe('three')

    enumDevicesSpy.mockReturnValueOnce(Promise.resolve(expandDeviceDefs(deviceDefs2)))
    // minimal devicechanged event - https://w3c.github.io/mediacapture-main/#dom-devicechangeevent
    navigator.mediaDevices.dispatchEvent(new Event('devicechange'))
    await waitFor(() => {
      expect(args.ondeviceid).toHaveBeenCalledWith(deviceDefs[1].deviceId)
    })

    // TODO - fix why new length not showing in DOM
    //   await waitFor(async () =>
    //    expect([...devices.options].map((o) => o.value)).toEqual(deviceDefs2.map((d) => d.deviceId))
    //  )
    //    const devices2 = canvas.getByRole('combobox', { name: 'Input:' }) as HTMLSelectElement
    setTimeout(() => console.log(devices.options), 2000) // still showing 3 items!!!
    // await userEvent.selectOptions(devices, 'four')
  }}
></Story>
