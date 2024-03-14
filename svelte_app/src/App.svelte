<script>
	import { Router, Route } from 'svelte-routing';
	import SpotlightCarousel from './SpotlightCarousel.svelte';
	import ItemRow from './ItemRow.svelte';
	import ItemDetail from './routes/ItemDetail.svelte';
  </script>
  
  <Router>
	<Route path="/">
	  <SpotlightCarousel />
	  <!-- <ItemRow /> -->
	</Route>
	<Route path="/detail/:title" component={ItemDetail} />
  </Router>
  