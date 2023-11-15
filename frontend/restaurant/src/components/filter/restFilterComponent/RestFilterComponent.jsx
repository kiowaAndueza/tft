import React, { useEffect, useState } from "react";
import "./RestFilterComponent.css";
import {
  getAllergens,
  getCuisines,
  getRestaurants_by_filters,
} from "../../../services/apiService";
import { errorMessage } from "../../messages/Messages";
import LocationFilterComponent from "../locationFilterComponent/LocationFilterComponent";


export function RestFilterComponent(props) {
  const [rangeValue, setRangeValue] = useState(200);
  const [availableCuisines, setAvailableCuisines] = useState([]);
  const [availableAllergens, setAvailableAllergens] = useState([]);
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [selectedAllergens, setSelectedAllergens] = useState([]);
  const [location, setLocation] = useState(null);

  const {
    currentRestaurantIds,
    updateCurrentRestaurants,
    updateCurrentRestaurantIds,
    initialRestaurants
  } = props;

  const handleRangeChange = (e) => {
    setRangeValue(e.target.value);
  };

  const handleCuisineChange = (e) => {
    const cuisine = e.target.value;
    setSelectedCuisines((prevCuisines) =>
      e.target.checked
        ? [...prevCuisines, cuisine]
        : prevCuisines.filter((c) => c !== cuisine)
    );
  };

  const handleAllergenChange = (e) => {
    const allergen = e.target.value;
    setSelectedAllergens((prevAllergens) =>
      e.target.checked
        ? [...prevAllergens, allergen]
        : prevAllergens.filter((a) => a !== allergen)
    );
  };

  const handleSubmit = async () => {
    try {
      const filters = {
        cuisines: selectedCuisines,
        allergens: selectedAllergens,
        price: rangeValue,
        location: location
      };

      const response = await getRestaurants_by_filters(
        currentRestaurantIds,
        filters
      );

      let restaurantData = response.data;
      let restaurantIds = [];
      if (restaurantData.length > 0) {
        restaurantIds = restaurantData.map(
          (restaurant) => restaurant.restaurant_id
        );
      }

      updateCurrentRestaurantIds(restaurantIds);
      updateCurrentRestaurants(restaurantData);
    } catch (error) {
      errorMessage("Error al aplicar filtros");
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const cuisinesResponse = await getCuisines();
        const allergensResponse = await getAllergens();

        const cuisines = cuisinesResponse.data;
        const allergens = allergensResponse.data;

        setAvailableCuisines(cuisines);
        setAvailableAllergens(allergens);
      } catch (error) {
        errorMessage("Error al obtener los tipos de cocina y/o alérgenos");
      }
    }

    fetchData();
  }, []);

  const handleLocationChange = (newLocation) => {
    setLocation(newLocation);
    console.log(newLocation);
  };

  return (
    <div className="container d-flex justify-content-center row mb-2">
      <div className="col-12 col-md-12 col-lg-12 col-xs-12 rest-filter title-filter">
        <h3 className="title-with-underline mb-4">Filtros</h3>
        <div className="mb-1 title-filter-text">Precio medio por comensal:</div>
        <div className="input-group mb-3">
          <div className="range-label mf-1 me-2">5€</div>
          <input
            type="range"
            className="form-range custom-range"
            id="customRange"
            min="5"
            max="200"
            step="1"
            value={rangeValue}
            onChange={handleRangeChange}
            title={`${rangeValue}€`}
          />

          <div className="range-label ms-2">200€</div>
        </div>
        <LocationFilterComponent
          handleLocationChange={handleLocationChange}
        />
        <div className="mt-3 mb-1 title-filter-text">Cocina:</div>
        <div className="mb-4 types-filter row">
          {availableCuisines.map((cuisine, index) => (
            <div className="col-6" key={index}>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`cuisine-${index}`}
                  value={cuisine}
                  onChange={handleCuisineChange}
                />
                <label
                  className="form-check-label"
                  htmlFor={`cuisine-${index}`}
                >
                  {cuisine}
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-1 title-filter-text">Alérgeno:</div>
        <div className="mb-4 types-filter row">
          {availableAllergens.map((allergen, index) => (
            <div className="col-6" key={index}>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`allergen-${index}`}
                  value={allergen}
                  onChange={handleAllergenChange}
                />
                <label
                  className="form-check-label"
                  htmlFor={`allergen-${index}`}
                >
                  {allergen}
                </label>
              </div>
            </div>
          ))}
        </div>
        <div className="mb-2 text-center">
          <button
            className="btn btn-block btn-rest-filter"
            onClick={handleSubmit}
          >
            Aplicar Filtros
          </button>
        </div>
      </div>
    </div>
  );
}

export default RestFilterComponent;
