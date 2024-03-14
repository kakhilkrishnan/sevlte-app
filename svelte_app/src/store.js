// store.js
import { createMachine } from "xstate";

export const itemMachine = createMachine({
  id: "item",
  initial: "unfocused",
  states: {
    unfocused: {
      on: { FOCUS: "focused" },
    },
    focused: {
      on: { BLUR: "unfocused" },
    },
  },
});
{
  console.log("item", itemMachine);
}
