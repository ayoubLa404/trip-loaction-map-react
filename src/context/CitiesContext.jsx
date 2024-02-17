import { useCallback } from 'react';
import { useEffect, useReducer, useContext, createContext } from 'react';

const BASE_URL = 'http://localhost:9000';

// 1)create a context
const CitiesContext = createContext();
//////////////////////////// //////////////////

const initialState = { cities: [], isLoading: false, currentCity: {}, error: '' };

function reducer(state, action) {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true };

    case 'cities/loaded':
      return { ...state, isLoading: false, cities: action.payload };

    case 'city/loaded':
      return { ...state, isLoading: false, currentCity: action.payload };

    case 'city/create':
      return {
        ...state,
        isLoading: false,
        cities: [...state.cities, action.payload],
        currentCity: action.payload,
      };

    case 'city/delete':
      return {
        ...state,
        isLoading: false,
        cities: state.cities.filter((city) => city.id !== action.payload),
        currentCity: {},
      };

    case 'rejectedError':
      return { ...state, isLoading: false, error: action.payload };

    default:
      throw new Error('unknown action');
  }
}

function CitiesProvider({ children }) {
  const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(
    reducer,
    initialState
  );
  // const [cities, setCities] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [currentCity, setCurrentCity] = useState({});

  // fetch all the city in app mount
  useEffect(() => {
    const controller = new AbortController();

    async function fetchCities() {
      try {
        dispatch({ type: 'loading' });

        const res = await fetch(`${BASE_URL}/cities`, { signal: controller.signal });
        const data = await res.json();

        dispatch({ type: 'cities/loaded', payload: data });
      } catch (err) {
        if (err.name !== 'AbortError')
          dispatch({
            type: 'rejectedError',
            payload: 'there was an error fetching data cities',
          });
      }
    }

    fetchCities();
    return () => controller.abort();
  }, []);

  // fetch one city
  const fetchCurrentCity = useCallback(
    async (cityId) => {
      // if we fetch a city data and it's the same city  don't fetch bc we already have it
      if (cityId === currentCity.id) return;
      try {
        dispatch({ type: 'loading' });

        const res = await fetch(`${BASE_URL}/cities/${cityId}`);
        const data = await res.json();

        dispatch({ type: 'city/loaded', payload: data });
      } catch (err) {
        dispatch({
          type: 'rejectedError',
          payload: 'there was an error fetching city data',
        });
      }
    },
    [currentCity.id]
  );

  async function createAndPostNewCity(newCity) {
    try {
      dispatch({ type: 'loading' });
      const res = await fetch(`${BASE_URL}/cities`, {
        method: 'POST',
        body: JSON.stringify(newCity),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      dispatch({ type: 'city/create', payload: data });
    } catch (err) {
      dispatch({
        type: 'rejectedError',
        payload: 'there a was problme creating this city',
      });
    }
  }

  // delete a city from the api
  async function DeleteACityFromAPI(id) {
    try {
      dispatch({ type: 'loading' });
      await fetch(`${BASE_URL}/cities/${id}`, { method: 'DELETE' });

      dispatch({ type: 'city/delete', payload: id });
    } catch (err) {
      dispatch({
        type: 'rejectedError',
        payload: 'there a was problme deleting this city',
      });
    }
  }

  // 2)create a provider and pass value obj
  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        fetchCurrentCity,
        currentCity,
        createAndPostNewCity,
        DeleteACityFromAPI,
      }}>
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);
  if (context === undefined)
    throw new Error('you are using context outside the provider component');
  return context;
}

export { CitiesProvider, useCities };
