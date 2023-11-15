import React, { useState, useEffect } from "react";
import { BsX } from "react-icons/bs";
import { AiOutlinePhone, AiOutlineEnvironment, AiFillDollarCircle, AiOutlineFieldNumber } from "react-icons/ai";
import { BiRestaurant, BiDish, BiTimeFive } from "react-icons/bi";
import { HiUserGroup } from "react-icons/hi2";
import { GiSpain } from "react-icons/gi";
import { MdNoFood } from "react-icons/md";
import "./RestaurantDetailsForm.css";
import { getAllergens, getCuisines, addDetails, getDetails } from "../../services/apiService";
import authProvider from "../../auth/authProvider";
import { useNavigate } from "react-router-dom";
import { getRestaurant } from "../../services/authService";
import { confirmationMessage, errorMessage, successfulMessage } from "../messages/Messages";
import { MinCharactersConstraint } from "../../validator/minCharactersConstraint";
import { MaxCharactersConstraint } from "../../validator/maxCharactersConstraint";
import { MinRangeConstraint } from "../../validator/minRangeConstraint";
import { PhoneConstraint } from "../../validator/phoneConstraint";


function RestaurantDetailsForm() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [availableCuisines, setAvailableCuisines] = useState([]);
  const [selectedAllergen, setSelectedAllergen] = useState("");
  const [availableAllergens, setAvailableAllergens] = useState([]);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedStartTime, setSelectedStartTime] = useState("");
  const [selectedEndTime, setSelectedEndTime] = useState("");

  const [restaurantData, setRestaurantData] = useState({
    restaurantName: '',
    province: '',
    number: '',
    street: '',
    address: ''
  });


  useEffect(() => {
    getRestaurant(userId)
      .then(response => {
        const data = response.data;
        setRestaurantData(data);
        getDetails(userId)
          .then(response => {
            const responseDetails = response.data;
            console.log(responseDetails)
            if (Object.keys(responseDetails).length > 0) {
              setRestaurant(prevRestaurant => ({
                ...prevRestaurant,
                allergens: responseDetails.allergens || [],
                capacity: responseDetails.capacity || "",
                cuisines: responseDetails.cuisines || "",
                description: responseDetails.description || "",
                opening_hours: responseDetails.opening_hours || [],
                phone: responseDetails.phone || "",
                price: responseDetails.price || "",
              }));
              console.log(restaurant.photos)
              responseDetails.menu.forEach(menuItem => {
                setMenuItems(prevMenuItems => [...prevMenuItems, menuItem]);
              });
            }
          })
      })
      .catch(error => {
        errorMessage('Error al obtener los datos del restaurante')
      });
  }, []);

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
        errorMessage('Error al obtener los tipos de cocina y/o alérgenos')
      }
    }

    fetchData();
  }, []);

  const redirectToPath = async (path) => {
    await navigate(path);
  };

  const checkPermission = async () => {
    const permissions = await authProvider.getPermissions();
    const hasPermission = permissions.includes("details");

    if (!hasPermission) {
      redirectToPath("/home");
    }
  };

  useEffect(() => {
    checkPermission();
  },);


  const [restaurant, setRestaurant] = useState({
    phone: "",
    description: "",
    capacity: "",
    price: "",
    allergens: [],
    opening_hours: [],
    cuisines: [],
    photos: [],
    menu: []
  });

  const allowedCategories = ["Entrantes", "Platos", "Bebidas", "Postres"];
  const quantity = ["Ración", "Media ración", "Unidad"];

  const [menuItems, setMenuItems] = useState([]);
  const [menuItem, setMenuItem] = useState({
    category: "",
    name: "",
    price: "",
    quantity: "",
  });

  const handleAddMenuItem = () => {
    if (
      menuItem.category.trim() !== "" &&
      menuItem.name.trim() !== "" &&
      menuItem.price.trim() !== ""
    ) {
      setMenuItems([...menuItems, menuItem]);
      setMenuItem({
        category: "",
        name: "",
        price: "",
        quantity: "",
      });
    }
  };

  const handleRemoveMenuItem = (index) => {
    confirmationMessage("¿Estás seguro de que deseas el plato del menú?")
      .then((result) => {
        if (result.isConfirmed) {
          const updatedMenuItems = [...menuItems];
          updatedMenuItems.splice(index, 1);
          setMenuItems(updatedMenuItems);
        }
      });
  };


  const handleInputChange = (fieldName, value) => {
    setRestaurant(prevData => ({
      ...prevData,
      [fieldName]: value,
    }));
    validateField(fieldName, value);
  };


  const validateImage = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const minWidth = 900;
        const minHeight = 600;

        if (img.width >= minWidth && img.height >= minHeight) {
          resolve();
          setErrorMessages({
            ...errorMessages,
            photos: "",
          });
        } else {
          setErrorMessages({
            ...errorMessages,
            photos: "La imagen debe tener de resolución al menos 600x900 píxeles",
          });
        }
      };
    });
  };


  const handleAddItem = async (field, value) => {
    const isEmpty = (str) => typeof str === 'string' && str.trim() === '';

    if (field === "photos") {
      const files = Array.from(value);
      const validFiles = [];

      for (const file of files) {
        try {
          await validateImage(file);
          validFiles.push(file);
        } catch (error) {
          errorMessage(error);
        }
      }

      if (restaurant[field].length + validFiles.length > 15) {
        errorMessage("Solo se pueden añadir 15 fotos como máximo");
        return;
      }

      setRestaurant({
        ...restaurant,
        [field]: [...restaurant[field], ...validFiles],
      });

    } else if (field === "opening_hours" && !isEmpty(value.day) && !isEmpty(value.start_time) && !isEmpty(value.end_time)) {
      setRestaurant({
        ...restaurant,
        [field]: [...restaurant[field], value],
      });
      setSelectedDay("");
      setSelectedStartTime("");
      setSelectedEndTime("");
    } else if (!isEmpty(value)) {
      setRestaurant({
        ...restaurant,
        [field]: [...restaurant[field], field === "menu" ? JSON.parse(value) : value.trim()],
      });
    }

    setErrorMessages((prevMessages) => ({
      ...prevMessages,
      [field]: isEmpty(value) ? "El campo no puede estar vacío." : "",
    }));
  };

  const handleRemoveItem = (field, index) => {
    confirmationMessage(`¿Estás seguro de que deseas eliminarlo?`)
      .then((result) => {
        if (result.isConfirmed) {
          const updatedItems = [...restaurant[field]];
          updatedItems.splice(index, 1);
          setRestaurant({ ...restaurant, [field]: updatedItems });
        }
      });
  };

  const [errorMessages, setErrorMessages] = useState({
    phone: "",
    description: "",
    capacity: "",
    price: "",
    allergens: "",
    opening_hours: "",
    cuisines: "",
    photos: "",
    menu: ""
  });

  const validateField = (name, value) => {
    switch (name) {
      case "phone":
        const phoneConstraint = new PhoneConstraint(name, value.trim());
        setErrorMessages({
          ...errorMessages,
          [name]: phoneConstraint.test(),
        });
        break;
      case "description":
        const minCharsConstraint = new MinCharactersConstraint(
          "La descripción",
          value.trim(),
          20
        );
        const maxCharsConstraint = new MaxCharactersConstraint(
          "La descripción",
          value.trim(),
          1500
        );
        setErrorMessages({
          ...errorMessages,
          [name]:
            minCharsConstraint.test() || maxCharsConstraint.test(),
        });
        break;
      case "capacity":
        const minCapacity = new MinRangeConstraint(
          "El aforo",
          value,
          0
        );
        setErrorMessages({
          ...errorMessages,
          [name]: minCapacity.test(),
        });
        break;
      case "price":
        const minPrice = new MinRangeConstraint(
          "El precio",
          value,
          0.09
        );
        setErrorMessages({
          ...errorMessages,
          [name]: minPrice.test(),
        });
        break;
      default:
        break;
    }
  }



  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = ["phone", "description", "capacity", "price"];
    const errorMessages = {
      phone: "El campo no puede estar vacío.",
      description: "El campo no puede estar vacío.",
      capacity: "El campo no puede estar vacío.",
      price: "El campo no puede estar vacío.",
    };

    const fieldMapping = {
      capacity: (value) => parseInt(value),
      price: (value) => parseFloat(value),
      allergens: (values) => values.map((item) => item.trim()),
      opening_hours: (values) =>
        values.map((item) => ({
          day: item.day,
          start_time: item.start_time,
          end_time: item.end_time,
        })),
      menu: (values) =>
        values.map((item) => ({
          category: item.category,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      cuisines: (values) => values.map((item) => item.trim()),
    };

    const hasFieldErrors = requiredFields.some((field) => {
      if (!restaurant[field].trim()) {
        setErrorMessages((prevMessages) => ({
          ...prevMessages,
          [field]: errorMessages[field],
        }));
        return true;
      } else {
        setErrorMessages((prevMessages) => ({
          ...prevMessages,
          [field]: "",
        }));
        return false;
      }
    });

    const fieldsLength = ["cuisines", "photos", "opening_hours"];
    fieldsLength.forEach((field) => {
      if (!Array.isArray(restaurant[field]) || restaurant[field].length === 0) {
        setErrorMessages((prevMessages) => ({
          ...prevMessages,
          [field]: "Debes añadir al menos uno.",
        }));
      } else {
        setErrorMessages((prevMessages) => ({
          ...prevMessages,
          [field]: "",
        }));
      }
    });

    if (!Array.isArray(menuItems) || menuItems.length === 0) {
      setErrorMessages((prevMessages) => ({
        ...prevMessages,
        menu: "Debes añadir al menos un elemento al menú.",
      }));
    } else {
      setErrorMessages((prevMessages) => ({
        ...prevMessages,
        menu: "",
      }));
    }

    if (hasFieldErrors || fieldsLength.some((field) => restaurant[field].length === 0)) {
      errorMessage("Por favor, corrige los errores del formulario.");
    } else {
      const parsedRestaurant = { ...restaurant };
      parsedRestaurant.capacity = fieldMapping.capacity(parsedRestaurant.capacity);
      parsedRestaurant.price = fieldMapping.price(parsedRestaurant.price);
      parsedRestaurant.menu = menuItems;

      const formData = new FormData();
      for (const key in parsedRestaurant) {
        if (Array.isArray(parsedRestaurant[key])) {
          if (key === "opening_hours" || key === "menu") {
            formData.append(key, JSON.stringify(parsedRestaurant[key]));
          } else {
            parsedRestaurant[key].forEach((item, index) => {
              formData.append(`${key}[${index}]`, item);
            });
          }
        } else {
          formData.append(key, parsedRestaurant[key]);
        }
      }

      try {
        await addDetails(userId, formData);
        successfulMessage("Los cambios se han guardado correctamente.");
      } catch (error) {
        console.log(error);
        errorMessage("Hubo un error al guardar los cambios.");
      }
    }
  };




  return (
    <div className="container mt-5">
      <h1>Detalles:</h1>
      <form>
        <div className="row">
          <div className="col-lg-6 col-md-6 col-xs-6">
            <div className="input-group mb-1">
              <label htmlFor="name" className="form-label mb-0">
                Nombre Restaurante:
              </label>
            </div>
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <BiRestaurant className="home-icon" />
                </span>
              </div>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={restaurantData.restaurantName} readOnly disabled
              />
            </div>
          </div>
          <div className="col-lg-6 col-md-6 col-xs-6">
            <div className="input-group mb-1">
              <label htmlFor="phone" className="form-label mb-0">
                Teléfono de contacto*:
              </label>
            </div>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <AiOutlinePhone className="home-icon" />
                </span>
              </div>
              <input
                type="text"
                className="form-control"
                id="phone"
                name="phone"
                value={restaurant.phone}
                onChange={e => handleInputChange('phone', e.target.value)}
                placeholder="Teléfono"
              />
            </div>
            <div className="errorMessage">{errorMessages.phone}</div>
          </div>
        </div>
        <div className="row mt-2">
          <div className="col-lg-6 col-md-6 col-xs-6">
            <div className="input-group mb-1">
              <label htmlFor="street" className="form-label mb-0">
                Calle:
              </label>
            </div>
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <AiOutlineEnvironment className="home-icon" />
                </span>
              </div>
              <input type="text" className="form-control" id="street" name="street" value={restaurantData.street} readOnly disabled />
            </div>
          </div>
          <div className="col-lg-2 col-md-2 col-xs-2">
            <div className="input-group mb-1">
              <label htmlFor="number" className="form-label mb-0">
                Nº:
              </label>
            </div>
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <AiOutlineFieldNumber className="home-icon" />
                </span>
              </div>
              <input
                type="number"
                className="form-control"
                id="number"
                name="number"
                value={restaurantData.number} readOnly disabled
              />
            </div>
          </div>
          <div className="col-lg-4 col-md-4 col-xs-4">
            <div className="input-group mb-1">
              <label htmlFor="province" className="form-label mb-0">
                Provincia:
              </label>
            </div>
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <GiSpain className="home-icon" />
                </span>
              </div>
              <input
                type="text"
                className="form-control"
                id="province"
                name="province"
                value={restaurantData.province} readOnly disabled
              />
            </div>
          </div>
        </div>
        <div className="input-group mb-1">
          <label htmlFor="opening_hours" className="form-label mb-0">
            Horario de Apertura*:
          </label>
        </div>
        <div className="input-group">
          <div className="input-group-prepend">
            <span className="input-group-text">
              <BiTimeFive className="home-icon" />
            </span>
          </div>
          <select
            className="form-control"
            id="day"
            name="day"
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
          >
            <option value="">Selecciona el día</option>
            <option value="Lunes">Lunes</option>
            <option value="Martes">Martes</option>
            <option value="Miércoles">Miércoles</option>
            <option value="Jueves">Jueves</option>
            <option value="Viernes">Viernes</option>
            <option value="Sábado">Sábado</option>
            <option value="Domingo">Domingo</option>
          </select>
          <input
            type="time"
            className="form-control"
            id="start_time"
            name="start_time"
            value={selectedStartTime}
            onChange={(e) => setSelectedStartTime(e.target.value)}
          />
          <input
            type="time"
            className="form-control"
            id="end_time"
            name="end_time"
            value={selectedEndTime}
            onChange={(e) => setSelectedEndTime(e.target.value)}
          />
          <button
            type="button"
            className="btn-typeCuisine"
            onClick={() =>
              handleAddItem("opening_hours", {
                day: selectedDay,
                start_time: selectedStartTime,
                end_time: selectedEndTime,
              })
            }
          >
            Agregar
          </button>
        </div>
        <div className="errorMessage">{errorMessages.opening_hours}</div>
        <div className="mt-2 mb-3">
          {restaurant.opening_hours.map((openingHour, index) => (
            <div key={index} className="mb-2 opening_hours">
              {openingHour.day}: {openingHour.start_time} -{" "}
              {openingHour.end_time}
              <BsX
                className="text-danger ms-1 cursor-pointer"
                onClick={() => handleRemoveItem("opening_hours", index)}
              />
            </div>
          ))}
        </div>

        <div className="row">
          <div className="col-lg-6 col-md-6">
            <div className="input-group mb-1">
              <label htmlFor="capacity" className="form-label mb-0">
                Aforo*:
              </label>
            </div>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <HiUserGroup className="home-icon" />
                </span>
              </div>
              <input
                type="number"
                className="form-control"
                id="capacity"
                name="capacity"
                value={restaurant.capacity}
                min="1"
                onChange={e => handleInputChange('capacity', e.target.value)}
                placeholder="Aforo"
              />
            </div>
            <div className="errorMessage">{errorMessages.capacity}</div>
          </div>
          <div className="col-lg-6 col-md-6 mt-2">
            <div className="input-group mb-1">
              <label htmlFor="price" className="form-label mb-0">
                Precio medio por comensal* (€):
              </label>
            </div>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <AiFillDollarCircle className="home-icon" />
                </span>
              </div>
              <input
                type="number"
                className="form-control"
                id="price"
                name="price"
                min="0.1"
                step="0.10"
                value={restaurant.price}
                onChange={e => handleInputChange('price', e.target.value)}
                placeholder="Precio medio por comensal"
              />
            </div>
            <div className="errorMessage">{errorMessages.price}</div>
          </div>
        </div>
        <div className="input-group mt-2 mb-1">
          <label htmlFor="description" className="form-label mb-0">
            Descripción*:
          </label>
        </div>
        <div className="input-group">
          <textarea
            type="text"
            className="form-control"
            rows="10"
            id="description"
            name="description"
            value={restaurant.description}
            onChange={e => handleInputChange('description', e.target.value)}
            placeholder="Descripción"
          />
        </div>
        <div className="errorMessage">{errorMessages.description}</div>

        <div className="input-group mt-3 mb-1">
          <label htmlFor="cuisine" className="form-label mb-0">
            Tipo de Cocina*:
          </label>
        </div>
        <div className="input-group mb-2">
          <div className="input-group-prepend">
            <span className="input-group-text">
              <BiDish className="home-icon" />
            </span>
          </div>
          <select
            className="form-control"
            id="cuisine"
            name="cuisine"
            placeholder="Tipo de cocina"
            value={selectedCuisine}
            onChange={(e) => setSelectedCuisine(e.target.value)}
          >
            <option value="">Selecciona un tipo de cocina</option>
            {availableCuisines.map((cuisine, index) => (
              <option key={index} value={cuisine}>
                {cuisine}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn-typeCuisine"
            onClick={() => handleAddItem("cuisines", selectedCuisine)}
          >
            Añadir
          </button>
        </div>
        <div className="errorMessage">{errorMessages.cuisines}</div>
        <div className="mt-2 mb-3">
          {restaurant.cuisines.map((cuisine, index) => (
            <span
              key={index}
              className="badge bg-success me-2 mb-2 cuisine-badge"
              style={{ cursor: "pointer" }}
              onClick={() => handleRemoveItem("cuisines", index)}
            >
              {cuisine} <BsX className="text-white" />
            </span>
          ))}
        </div>
        <div className="input-group mt-3 mb-1">
          <label htmlFor="allergen" className="form-label mb-0">
            Tipo de Alergéno:
          </label>
        </div>
        <div className="input-group mb-2">
          <div className="input-group-prepend">
            <span className="input-group-text">
              <MdNoFood className="home-icon" />
            </span>
          </div>
          <select
            className="form-control"
            id="allergens"
            name="allergens"
            placeholder="Tipo de alergénos"
            value={selectedAllergen}
            onChange={(e) => setSelectedAllergen(e.target.value)}
          >
            <option value="">Selecciona un tipo de alergéno</option>
            {availableAllergens.map((allergen, index) => (
              <option key={index} value={allergen}>
                {allergen}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn-typeCuisine"
            onClick={() => handleAddItem("allergens", selectedAllergen)}
          >
            Añadir
          </button>
        </div>
        <div className="mt-2 mb-3">
          {restaurant.allergens.map((allergen, index) => (
            <span
              key={index}
              className="badge bg-success me-2 mb-2 cuisine-badge"
              style={{ cursor: "pointer" }}
              onClick={() => handleRemoveItem("allergens", index)}
            >
              {allergen} <BsX className="text-white" />
            </span>
          ))}
        </div>
        <div className="mb-4 menu mt-5">
          <h4>Menú del Restaurante:</h4>
          <div className="form-group">
            <label htmlFor="category" className="detailsMenu mb-1">
              Categoría*
            </label>
            <select
              className="form-control"
              id="category"
              name="category"
              value={menuItem.category}
              onChange={(e) =>
                setMenuItem({ ...menuItem, category: e.target.value })
              }
            >
              <option value="">Selecciona una categoría</option>
              {allowedCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="name" className="detailsMenu mb-1">
              Nombre*
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={menuItem.name}
              onChange={(e) =>
                setMenuItem({ ...menuItem, name: e.target.value })
              }
              placeholder="Nombre del plato"
            />
          </div>
          <div className="form-group">
            <label htmlFor="price" className="detailsMenu mb-1">
              Precio* (€)
            </label>
            <input
              type="number"
              min="0.1"
              step="0.10"
              className="form-control"
              id="price"
              name="price"
              value={menuItem.price}
              onChange={(e) =>
                setMenuItem({ ...menuItem, price: e.target.value })
              }
              placeholder="Precio (€)"
            />
          </div>
          <div className="form-group">
            <label htmlFor="quantity" className="detailsMenu mb-1">
              Cantidad
            </label>
            <select
              id="quantity"
              className="form-control"
              name="quantity"
              value={menuItem.quantity || ""}
              onChange={(e) =>
                setMenuItem({ ...menuItem, quantity: e.target.value || null })
              }
            >
              <option value="">Selecciona cantidad</option>
              {quantity.map((quantity) => (
                <option key={quantity} value={quantity}>
                  {quantity}
                </option>
              ))}
            </select>
          </div>
          <div className="errorMessage">{errorMessages.menu}</div>
          <div className="form-group text-center">
            <button
              type="button"
              className="btn btn-primary btn-typeCuisine mt-4"
              onClick={handleAddMenuItem}
            >
              Agregar
            </button>
          </div>
          <div className="mt-2">
            <ul className="list-group">
              {menuItems.map((item, index) => (
                <li
                  key={index}
                  className="list-group-item d-flex justify-content-between align-items-center mb-2"
                >
                  <div>
                    <strong>{item.category}</strong>
                    <br />
                    {item.name}
                    <br />
                    Precio: {item.price} €<br />
                    Cantidad: {item.quantity}
                  </div>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => handleRemoveMenuItem(index)}
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="">
          <label htmlFor="photos" className="form-label">
            Cargar Imágenes (Max 15):
          </label>
          <input
            type="file"
            className="form-control"
            id="photos"
            name="photos"
            accept="image/*"
            multiple
            onChange={(e) => handleAddItem("photos", e.target.files)}
          />
        </div>
        <div className="errorMessage">{errorMessages.photos}</div>
        <div className="mt-3 mb-4">
          <h4>Imágenes del Restaurante:</h4>
          <ul className="list-unstyled">
            {restaurant.photos.map((photo, index) => (
              <li key={index} className="mb-2 opening_hours ">
                {photo.name }
                <BsX
                  className="text-danger ml-2 cursor-pointer"
                  onClick={() => handleRemoveItem("photos", index)}
                />
              </li>
            ))}
          </ul>
        </div>

        <button type="submit" className="row col-md-12 col-lg-12 col-xs-12 col-12 btn btn-primary btn-details" onClick={handleSubmit}>
          Guardar
        </button>
      </form>
    </div>
  );
}

export default RestaurantDetailsForm;
