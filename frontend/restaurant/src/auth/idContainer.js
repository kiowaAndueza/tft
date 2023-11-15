import { createStore } from 'state-pool';

export const idContainer = createStore({
  id: localStorage.getItem('userId') || ""
});

idContainer.subscribe("id", (newValue) => {
  localStorage.setItem('userId', newValue);
});
