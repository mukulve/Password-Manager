<script>
  import { Router, Route } from "svelte-navigator";
  import Home from "./lib/Home.svelte";
  import AddEntry from "./lib/AddEntry.svelte";
  import View from "./lib/View.svelte";
</script>

<Router>
  <Route path="/">
    <Home />
  </Route>
  <Route path="add" component={AddEntry} />
  <Route path="view" component={View} />
</Router>
