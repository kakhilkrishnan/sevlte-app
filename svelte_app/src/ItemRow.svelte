<script>
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';

  let items = [];

  function fetchData(timeout) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const sampleData = [
        { id: 1, title: "Spotlight Item 1" },
        { id: 2, title: "Spotlight Item 2" },
        { id: 3, title: "Spotlight Item 3" },
        { id: 4, title: "Spotlight Item 4" },
      ];
      resolve(sampleData);
    }, timeout);
  });
}

  onMount(async () => {
    const response = await fetchData(2000);
    const data = await response;
    items = data;
  });

  function navigateToDetail(title) {
    navigate(`/detail/${encodeURIComponent(title)}`);
  }
</script>

<div class="item-row">
  <!-- Display item rows -->
  {#each items as item}
    <div class="item" on:click={() => navigateToDetail(item.title)}>{item.title}</div>
  {/each}
</div>
