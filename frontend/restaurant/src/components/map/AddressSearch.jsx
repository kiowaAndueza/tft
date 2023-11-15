import { mapSearch } from "../../services/MapSearch";

export function AddressSearch(text) {
  return mapSearch(text)
    .then((response) => {
      console.log("Respuesta de la API:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error(error);
      return [];
    });
}

