<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import { within, waitFor, expect, fn, spyOn, userEvent } from '@storybook/test'

  import { resetSettings, settings } from '@lib/persistentStore.js' // TODO: this is saving in host browser not chromium
  import InputDevices from '@components/InputDevices.svelte'

  interface DeviceDef extends Omit<MediaDeviceInfo, 'kind' | 'groupId' | 'toJSON'> {}

  function expandDeviceDefs(defs: DeviceDef[]) {
    return defs.map(
      (d: DeviceDef) =>
        ({ ...d, kind: 'audioinput', groupId: '', toJSON: () => {} }) as MediaDeviceInfo
    )
  }

  const { Story } = defineMeta({
    title: 'InputDevices',
    component: InputDevices,
    tags: ['_autodocs'],
    argTypes: {},
    args: {
      ondeviceid: fn()
    },
    async beforeEach(ctx) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true })
      } catch (e) {
        if (e instanceof DOMException && (e as DOMException).name == 'NotFoundError') {
          // This seems to occur after hyberbnating and storybook is running
          alert(
            "Fatal 'NotFoundError' error calling 'getUserMedia' in 'beforeEach'\n\nYou probably need to reboot"
          )
        } else {
          throw e
        }
      }
      // Note also $settings doesn't work here so we would use settings.subscribe()
      const savedId = ctx.parameters.savedId
      resetSettings(savedId ? { deviceId: savedId } : undefined)

      if (ctx.parameters.deviceDefs) {
        const mediaDevices = expandDeviceDefs(ctx.parameters.deviceDefs)

        // Can't seem to hoist this to enclosure so run here for every Story
        // Not sure when is destroyed
        // I'm confused as this should run in host browser yet asserts in play work
        const enumDevicesSpy = spyOn(navigator.mediaDevices, 'enumerateDevices')
        enumDevicesSpy.mockImplementation(() => Promise.resolve(mediaDevices))
        ctx.parameters.enumDevicesSpy = enumDevicesSpy
      }
    }
  })
</script>

<Story name="Machine devices, no test" tags={['!test']}></Story>

<Story
  name="no devices"
  parameters={{
    resetSettings: true,
    deviceDefs: []
  }}
  play={async ({ args, parameters, canvasElement }) => {
    await waitFor(() => {
      expect(args.ondeviceid).toHaveBeenCalledWith('unknown')
    })

    const canvas = within(canvasElement)
    expect(canvas.getByText('No input devices found')).toBeInTheDocument()
    expect($settings.deviceId).toBe('') // will be last saved, we reset it
  }}
></Story>

<Story
  name="Single device none saved"
  parameters={{
    resetSettings: true,
    deviceDefs: [{ deviceId: 'one', label: 'Input Device' }]
  }}
  play={async ({ args, parameters, canvasElement }) => {
    const deviceId = parameters.deviceDefs[0].deviceId
    await waitFor(() => {
      expect(args.ondeviceid).toHaveBeenCalledWith(deviceId)
    })

    const canvas = within(canvasElement)
    const devices = canvas.getByRole('combobox', { name: 'Input:' }) as HTMLSelectElement
    expect([...devices.options].map((o) => o.value)).toEqual(
      parameters.deviceDefs.map((d: DeviceDef) => d.deviceId)
    )

    expect(devices).toHaveValue(deviceId)
    expect(devices).toBeDisabled()
    expect($settings.deviceId).toBe(deviceId)
  }}
></Story>

<Story
  name="Single Device saved Id"
  parameters={{
    savedId: 'one',
    deviceDefs: [{ deviceId: 'one', label: 'Input Device' }]
  }}
  play={async ({ args, parameters, canvasElement }) => {
    const deviceId = parameters.deviceDefs[0].deviceId
    await waitFor(() => {
      expect(args.ondeviceid).toHaveBeenCalledWith(deviceId)
    })

    const canvas = within(canvasElement)
    const devices = canvas.getByRole('combobox', { name: 'Input:' }) as HTMLSelectElement
    expect([...devices.options].map((o) => o.value)).toEqual(
      parameters.deviceDefs.map((d: DeviceDef) => d.deviceId)
    )
  }}
></Story>

<Story
  name="Single device another saved id"
  parameters={{
    savedId: 'random',
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
    expect(devices).toHaveValue('unknown')
    expect(devices).toBeEnabled()
    expect(getOptionValues(devices as HTMLSelectElement)).toEqual(['unknown', 'one'])
  }}
></Story>

<Story
  name="Single device another saved id, user selected"
  parameters={{
    savedId: 'random',
    deviceDefs: [{ deviceId: 'one', label: 'Input Device' }]
  }}
  play={async ({ args, parameters, canvasElement }) => {
    await waitFor(() => {
      expect(args.ondeviceid).toHaveBeenCalledWith('unknown')
    })

    const canvas = within(canvasElement)
    const devices = canvas.getByRole('combobox', { name: 'Input:' }) as HTMLSelectElement

    await userEvent.selectOptions(devices, 'one')
    expect(devices).toHaveValue('one')
    expect(devices).toBeDisabled()
  }}
></Story>

<Story
  name="Multiple devices one saved"
  parameters={{
    savedId: 'two',
    deviceDefs: [
      { deviceId: 'one', label: 'Input Device 1' },
      { deviceId: 'two', label: 'Input Device 2' },
      { deviceId: 'three', label: 'Input Device 3' }
    ]
  }}
  play={async ({ args, parameters, canvasElement }) => {
    const deviceId = parameters.deviceDefs[1].deviceId
    await waitFor(() => {
      expect(args.ondeviceid).toHaveBeenCalledWith(deviceId)
    })

    const canvas = within(canvasElement)
    const devices = canvas.getByRole('combobox', { name: 'Input:' }) as HTMLSelectElement
    expect([...devices.options].map((o) => o.value)).toEqual(
      parameters.deviceDefs.map((d: DeviceDef) => d.deviceId)
    )
    expect(devices).toHaveValue(deviceId)
    expect(devices).toBeEnabled()
  }}
></Story>

<Story
  name="Multiple devices user selection"
  parameters={{
    savedId: 'two',
    deviceDefs: [
      { deviceId: 'one', label: 'Input Device 1' },
      { deviceId: 'two', label: 'Input Device 2' },
      { deviceId: 'three', label: 'Input Device 3' }
    ]
  }}
  play={async ({ args, parameters, canvasElement }) => {
    const deviceId = parameters.deviceDefs[1].deviceId
    await waitFor(() => {
      expect(args.ondeviceid).toHaveBeenCalledWith(deviceId)
    })

    const canvas = within(canvasElement)
    const devices = canvas.getByRole('combobox', { name: 'Input:' }) as HTMLSelectElement

    const newDeviceId = 'three'
    await userEvent.selectOptions(devices, newDeviceId)
    expect(devices).toHaveValue(newDeviceId)
    expect($settings.deviceId).toBe(newDeviceId)
    await waitFor(() => {
      expect(args.ondeviceid).toHaveBeenNthCalledWith(2, newDeviceId)
    })
  }}
></Story>

<Story
  name="Is reactive to new devices"
  parameters={{
    savedId: 'two',
    deviceDefs: [
      { deviceId: 'one', label: 'Input Device 1' },
      { deviceId: 'two', label: 'Input Device 2' },
      { deviceId: 'three', label: 'Input Device 3' }
    ]
  }}
  play={async ({ args, parameters, canvasElement }) => {
    const deviceId = 'two'
    await waitFor(() => {
      expect(args.ondeviceid).toHaveBeenCalledWith(deviceId)
    })

    const deviceDefs2 = [...parameters.deviceDefs, { deviceId: 'four', label: 'Input Device 4' }]

    // update to 4 items to simulate new added
    parameters.enumDevicesSpy.mockReturnValue(Promise.resolve(expandDeviceDefs(deviceDefs2)))
    navigator.mediaDevices.dispatchEvent(new Event('devicechange')) // simulate new devices event

    await waitFor(async function checkOptions() {
      expect(args.ondeviceid).toHaveBeenNthCalledWith(2, deviceId) // we get this, possibly extraneous
    })
    // Option element gets recreated
    const canvas = within(canvasElement)
    const devices = canvas.getByRole('combobox', { name: 'Input:' }) as HTMLSelectElement

    expect([...devices.options].map((o) => o.value)).toEqual(
      deviceDefs2.map((d: DeviceDef) => d.deviceId)
    )

    const newDeviceId = 'four'
    await userEvent.selectOptions(devices, newDeviceId)
    expect(devices).toHaveValue(newDeviceId)
    await waitFor(() => {
      expect(args.ondeviceid).toHaveBeenNthCalledWith(3, newDeviceId)
    })
  }}
></Story>
