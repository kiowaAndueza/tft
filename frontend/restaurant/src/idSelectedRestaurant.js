import { createStore } from 'state-pool';

export const idSelectedRestaurant = createStore({
  id: localStorage.getItem('idRestaurant') || ""
});

idSelectedRestaurant.subscribe("id", (newValue) => {
  localStorage.setItem('idRestaurant', newValue);
});
