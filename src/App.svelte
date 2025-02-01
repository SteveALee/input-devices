<script>
  import InputDevices from '@components/InputDevices.svelte'

  let deviceId = $state('')

  function ondeviceid(_deviceId) {
    deviceId = _deviceId
  }
</script>

<InputDevices {ondeviceid} />

<pre>DeviceID: {deviceId}</pre>
