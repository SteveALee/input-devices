<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import { expect } from '@storybook/test'

  const { Story } = defineMeta({
    title: 'Test Local Storage',
    tags: ['_autodocs'],
    argTypes: {},
    async beforeEach(ctx) {
      localStorage.setItem('beforeEach', 'yes')
      return () => {
        console.log(`beforeEach: ${localStorage.getItem('beforeEach')}`)
        console.log(`play: ${localStorage.getItem('play')}`)
      }
    }
  })
</script>

<Story
  name="Test Local Storage"
  play={async () => {
    expect(localStorage.getItem('beforeEach')).toBe('yes')
    localStorage.setItem('play', 'yes')
    expect(localStorage.getItem('play')).toBe('yes')
  }}
>
  {#snippet children(args)}
    <h2>Test Local Storage</h2>
  {/snippet}</Story
>
