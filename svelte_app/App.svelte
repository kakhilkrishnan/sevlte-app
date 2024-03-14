<script>
  import { Router, Route } from 'svelte-routing';
  import SpotlightCarousel from './src/SpotlightCarousel.svelte';
  import ItemRow from './src/ItemRow.svelte';
  import ItemDetail from './src/routes/ItemDetail.svelte';
</script>

<Router>
  <Route path="/">
    <SpotlightCarousel />
    <!-- <ItemRow /> -->
  </Route>
  <Route path="/detail/:title" component={ItemDetail} />
</Router>
