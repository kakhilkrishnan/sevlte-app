<!-- ItemDetail.svelte -->
<script>
  import { onMount } from "svelte";

  import { writable } from "svelte/store";

  let title = writable("");

  onMount(() => {
    const pathname = decodeURIComponent(window.location.pathname);
    console.log("Pathname:", pathname);
    const parts = pathname.split("/");
    console.log("Parts:", parts);
    // Assuming the title is the last part of the URL
    title.set(parts[parts.length - 1]);
  });
</script>

<a href="/"><button class="button-33">Back</button></a>
<div class="item-detail">
  <h2>{$title}</h2>
</div>

<style>
  /* CSS */
  .button-33 {
    background-color: #c2fbd7;
    border-radius: 100px;
    box-shadow:
      rgba(44, 187, 99, 0.2) 0 -25px 18px -14px inset,
      rgba(44, 187, 99, 0.15) 0 1px 2px,
      rgba(44, 187, 99, 0.15) 0 2px 4px,
      rgba(44, 187, 99, 0.15) 0 4px 8px,
      rgba(44, 187, 99, 0.15) 0 8px 16px,
      rgba(44, 187, 99, 0.15) 0 16px 32px;
    color: green;
    cursor: pointer;
    display: inline-block;
    font-family:
      CerebriSans-Regular,
      -apple-system,
      system-ui,
      Roboto,
      sans-serif;
    padding: 7px 20px;
    text-align: center;
    text-decoration: none;
    transition: all 250ms;
    border: 0;
    font-size: 16px;
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
  }

  .button-33:hover {
    box-shadow:
      rgba(44, 187, 99, 0.35) 0 -25px 18px -14px inset,
      rgba(44, 187, 99, 0.25) 0 1px 2px,
      rgba(44, 187, 99, 0.25) 0 2px 4px,
      rgba(44, 187, 99, 0.25) 0 4px 8px,
      rgba(44, 187, 99, 0.25) 0 8px 16px,
      rgba(44, 187, 99, 0.25) 0 16px 32px;
    transform: scale(1.05) rotate(-1deg);
  }
  .item-detail {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh; /* Set height to full viewport height for vertical centering */
  }
</style>
