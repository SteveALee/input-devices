<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import { expect } from '@storybook/test'

  const { Story } = defineMeta({
    title: 'Test steps',
    async beforeEach(ctx) {
      console.log(`beforeEach`)
      return () => {
        console.log(`Clean up`)
      }
    }
  })
</script>

<Story
  name="Two steps"
  play={async () => {
    console.log('Play')
    expect(1).toBe(1)
    expect(2).toBe(2)
  }}
>
  {#snippet children(args)}
    <h2>Test test steps</h2>
  {/snippet}</Story
>
