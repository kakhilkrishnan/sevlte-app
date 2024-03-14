# svelte-store

svelte-store is a lightweight wrapper for sveltes context API. It guarantees syncronous action dispatches and allows custom middleware layers.

## Installation

`yarn add svelte-store`

## Usage

svelte-store is influenced largely by Redux and there are similarities between the APIs.

### Config

svelte-store needs a config array and a middleware array to start:

```
[{
    name: name of store
    store: svelte writables to store data
    reducer: reducer function to change state
}]
```

### Create a store;
Import createStore with `import { createStore } from 'svelte-store'` and give it some config.

```
// src/store.js
import { createStore } from 'svelte-store';
import { writable } from 'svelte/store';

const userWritable = writable({ name: "John" });
const appWritable = writable({  isNameBob: false  });

const userReducer = (state, action) => {
    switch (action.type) {
        case "SET_NAME":
            return { ...state, name: action.payload };
        default:
            return state;
    }
}

const appReducer = (state, action) => {
    switch(action.type) {
        case "SET_NAME":
            return { ...state, isNameBob: action.payload.toLowerCase() === 'bob'};
        default:
            return state;
    }
}

const store = createStore(
    [{
        name: "user",
        reducer: userReducer,
        store: userWritable

    }, {
        name: "app",
        reducer: appReducer,
        store: appWritable
    }]
    , [] // middleware array
)

export default store;
```

dispatch actions with the `store.dispatch` function.

```
// src/App.svelte
<script>
	import store from "./store";
	const userStore = store.getWritable("user");
	const appStore = store.getWritable("app");
    
</script>

<input on:change={(e) => store.dispatch({ type: "SET_NAME", payload: e.target.value })} value={userStore.name} />
<p>{appStore.isNameBob ? "Go away Bob" : "Hello, not bob"}</p>

```
Using the dispatch function means that your actions will go through the middleware layers and hit every reducer and store. If you dont have any middleware or you don't need to affect anywhere else in your app  then it's okay to bind to the svelte writables as you normally would but only the value you bind to will change as a result:

```
// src/App.svelte
<script>
	import store from "./store";
	const userStore = store.getWritable("user");
	const appStore = store.getWritable("app");
    
</script>

<input bind:value={userStore.name} />
<p>{appStore.isNameBob ? "Go away Bob" : "Hello, not bob"}</p> /* this wont work */

```

## Middleware

for middleware refer to middleware functions in the redux docs: https://redux.js.org/api/applymiddleware#example-custom-logger-middleware

and give them as a second argument to `createStore` as an array;