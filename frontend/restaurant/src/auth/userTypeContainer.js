import { createStore } from 'state-pool';

export const userTypeContainer = createStore({
  type: ""
});

userTypeContainer.subscribe("type", (newValue) => {
  localStorage.setItem('userType', newValue);
});