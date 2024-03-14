<script>
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import { Card, CardText, MaterialApp } from "svelte-materialify";
  import { itemMachine } from "./store";
  import { getContext } from "svelte";

  const itemContext = getContext(itemMachine);
  let send;
  let spotlightItems = [];
  let currentIndex = 0;
  let focusedItem = null; // Variable to store the currently focused item

  // Subscribe to changes in the context
  $: {
    if (itemContext) {
      send = itemContext.send;
    }
  }

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
    // Emulate fetching data from backend using promises
    const response = await fetchData(2000);
    const data = await response;
    spotlightItems = data;
  });

  function nextSlide() {
    currentIndex = (currentIndex + 1) % spotlightItems.length;
  }

  function prevSlide() {
    currentIndex =
      (currentIndex - 1 + spotlightItems.length) % spotlightItems.length;
  }

  function focusItem(item) {
    {
      console.log("item focused", item);
    }
    if (send) {
      send("FOCUS");
      focusedItem = item;
    }
  }

  function blurItem() {
    if (send) {
      send("BLUR");
      focusedItem = null;
    }

    // Implement logic to hide item's title
  }

  function navigateToDetail(title) {
    navigate(`/detail/${encodeURIComponent(title)}`);
    // navigate(`/detail/?title=`+ title);
    // {
    //   console.log("spotlightItems", `/detail/?title=`+ title);
    // }
  }
</script>

<!-- <div class="spotlight-carousel">
  <div class="carousel">
    {#if spotlightItems.length > 0}
      <div class="slide" style="transform: translateX(-{currentIndex * 100}%)">
        {#each spotlightItems as item (item.id)}
          <div class="item" on:click={() => navigateToDetail(item.title)}>
            {item.title}
          </div>
        {/each}
      </div>
    {:else}
      <div class="loading">Loading...</div>
    {/if}

    <button on:click={prevSlide}>&larr; Previous</button>
    <button on:click={nextSlide}>Next &rarr;</button>
  </div>
</div> -->
<div class="spotlight-carousel"></div>
<div class="carousel">
  {#if spotlightItems.length > 0}
    <!-- <div class="slide" style="transform: translateX(-{currentIndex * 100}%)"> -->
    {#each spotlightItems as item (item.id)}
      <!-- class="d-flex justify-center mt-4 mb-4" -->
      <div
        class="d-flex justify-center mt-4 mb-4 card-container"
        on:mouseenter={() => focusItem(item)}
        on:mouseleave={() => blurItem()}
      >
        <div class="card-style" style="max-width:300px">
          <div>
            <div on:click={() => navigateToDetail(item.title)}>
              {item.title}
            </div>
          </div>
        </div>
      </div>
    {/each}
    <!-- </div> -->
  {:else}
    <div class="loading">Loading...</div>
  {/if}
</div>

<style>
  .spotlight-carousel {
    position: relative;
    width: auto;
    width: 100%;
    overflow: hidden;
    color: rgb(8, 2, 71);
    border-radius: 8px;
    background-color: rgb(14, 233, 171);
    display: flex;
    height: 50%;
  }

  .card-container {
    display: flex;
    justify-content: center;
    margin: 10px;
  }

  .card-style {
    max-width: 300px;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Add shadow effect */
    transition: border-width 0.3s; /* Transition for hover effect */
  }

  .card-container:hover .card-style {
    border: 4px solid blue; /* Change border thickness on hover */
  }
  .carousel {
    /* position: relative;
    width: auto;
    overflow: hidden;
    color: rgb(8, 2, 71);
    border-radius: 8px;
    background-color: rgb(14, 233, 171);
    display: flex;
    height: 50%;
    justify-content: center; */
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .slide {
    display: flex;
    /* transition: transform 0.5s ease; */
  }

  .item {
    color: rgb(8, 2, 71);
    border-radius: 8px;
    background-color: rgb(189, 220, 18);
    display: flex;
    flex-direction: row;

    padding: 10px;
    align-items: center;
    margin: 10px;
    justify-content: center;
  }

  .item:hover {
    border: solid 4px black;
  }

  .button {
    /* position: absolute; */
    margin-top: 30px;
    top: 50%;
    transform: translateY(-50%);
    background-color: blue;
    border: none;
    cursor: pointer;
  }
</style>
