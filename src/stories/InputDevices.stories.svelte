<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import { within, waitFor, expect, fn, spyOn, userEvent } from '@storybook/test'

  import { settings } from '@lib/persistentStore.js' // TODO: this is saving in host browser not chromium
  import InputDevices from '@components/InputDevices.svelte'

  interface DeviceDef extends Omit<MediaDeviceInfo, 'kind' | 'groupId' | 'toJSON'> {}

  function expandDeviceDefs(deviceDefs: DeviceDef[]) {
    return deviceDefs.map(
      (d: DeviceDef) =>
        ({ ...d, kind: 'audioinput', groupId: '', toJSON: () => {} }) as MediaDeviceInfo
    )
  }

  function deviceDefLabel(deviceDefs: DeviceDef[], id: string) {
    return deviceDefs.find((d) => d.deviceId === id)?.label ?? ''
  }

  function getSelectValues(selectEl: HTMLSelectElement) {
    return [...selectEl.options].map((o) => o.value)
  }

  function expectSelectOptions(devices: HTMLSelectElement, deviceDefs: DeviceDef[]) {
    expect([...getSelectValues(devices)]).toEqual(deviceDefs.map((d) => d.deviceId))
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
      // Note also $ doesn't work with stores so use API directly
      const savedId = ctx.parameters.savedId
      settings.set({ deviceId: savedId ? savedId : '' })

      // spys need to be run in this function to work
      // vitest will destroy
      spyOn(navigator.mediaDevices, 'getUserMedia').mockReturnValue(
        Promise.resolve({} as MediaStream)
      )

      if (ctx.parameters.deviceDefs) {
        const mediaDevices = expandDeviceDefs(ctx.parameters.deviceDefs)
        const enumDevicesSpy = spyOn(navigator.mediaDevices, 'enumerateDevices')
        enumDevicesSpy.mockImplementation(() => Promise.resolve(mediaDevices))
        ctx.parameters.enumDevicesSpy = enumDevicesSpy
      }
    }
  })
</script>

<Story
  name="no devices"
  parameters={{
    resetSettings: true,
    deviceDefs: []
  }}
  play={async ({ args, parameters, canvasElement }) => {
    // We wait as Option is rendered asynchronously
    await waitFor(() => {
      expect(args.ondeviceid).toHaveBeenCalledWith('unknown')
    })

    const canvas = within(canvasElement)
    expect(canvas.getByText('No input devices found')).toBeInTheDocument()
    expect($settings.deviceId).toBe('') // will be last saved but we reset it
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
    expectSelectOptions(devices, parameters.deviceDefs)

    expect(devices).toHaveValue(deviceId)
    expect($settings.deviceId).toBe(deviceId)
    expect(devices).toBeDisabled()
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
    expectSelectOptions(devices, parameters.deviceDefs)
    expect(devices).toHaveValue(deviceId)
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

    const canvas = within(canvasElement)
    const devices = canvas.getByRole('combobox', { name: 'Input:' }) as HTMLSelectElement
    expect(getSelectValues(devices)).toEqual(['unknown', 'one'])
    expect(devices).toHaveValue('unknown')
    expect(devices).toBeEnabled()
  }}
></Story>

<Story
  name="Single device another saved id, selected"
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

    const newDeviceId = 'one'
    await userEvent.selectOptions(devices, deviceDefLabel(parameters.deviceDefs, newDeviceId))
    expect(devices).toHaveValue(newDeviceId)
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
    expectSelectOptions(devices, parameters.deviceDefs)
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

    await userEvent.selectOptions(devices, deviceDefLabel(parameters.deviceDefs, newDeviceId))
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

    expectSelectOptions(devices, deviceDefs2)

    const newDeviceId = 'four'
    await userEvent.selectOptions(devices, deviceDefLabel(deviceDefs2, newDeviceId))
    expect(devices).toHaveValue(newDeviceId)
    await waitFor(() => {
      expect(args.ondeviceid).toHaveBeenNthCalledWith(3, newDeviceId)
    })
  }}
></Story>
