import { useCallback, useEffect, useReducer, useContext, createContext } from 'react';

// 1) Create a context
const CitiesContext = createContext();

const initialState = { cities: [], isLoading: false, currentCity: {}, error: '' };

function reducer(state, action) {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true };
    case 'cities/loaded':
      return { ...state, isLoading: false, cities: action.payload.cities }; // Adjusted for JSON structure
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

  // Fetch all cities on app mount
  useEffect(() => {
    const controller = new AbortController();

    async function fetchCities(newCity) {
      try {
        dispatch({ type: 'loading' });
        const res = await fetch('/cities.json', {
          method: 'POST',
          body: JSON.stringify(newCity),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) throw new Error('Failed to fetch cities');
        const data = await res.json();
        dispatch({ type: 'cities/loaded', payload: data });
      } catch (err) {
        if (err.name !== 'AbortError') {
          dispatch({
            type: 'rejectedError',
            payload: 'There was an error fetching cities data',
          });
        }
      }
    }

    fetchCities();
    return () => controller.abort();
  }, []);

  // Fetch one city by ID (simulated from the static JSON)
  const fetchCurrentCity = useCallback(
    async (cityId) => {
      if (cityId === currentCity.id) return;
      try {
        dispatch({ type: 'loading' });
        const res = await fetch('/cities.json');
        if (!res.ok) throw new Error('Failed to fetch city');
        const data = await res.json();
        const city = data.cities.find((c) => c.id === cityId);
        if (!city) throw new Error('City not found');
        dispatch({ type: 'city/loaded', payload: city });
      } catch (err) {
        dispatch({
          type: 'rejectedError',
          payload: 'There was an error fetching city data',
        });
      }
    },
    [currentCity.id]
  );

  // Create a new city (simulated, no real POST to static JSON)
  async function createAndPostNewCity(newCity) {
    try {
      dispatch({ type: 'loading' });
      // Simulate a delay for realism
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch({ type: 'city/create', payload: newCity });
    } catch (err) {
      dispatch({
        type: 'rejectedError',
        payload: 'There was a problem creating this city',
      });
    }
  }

  // delete a city from the api
  async function DeleteACityFromAPI(id) {
    try {
      dispatch({ type: 'loading' });
      await new Promise((resolve) => setTimeout(resolve, 500));
      await fetch(`/cities/${id}`, { method: 'DELETE' });

      dispatch({ type: 'city/delete', payload: id });
    } catch (err) {
      dispatch({
        type: 'rejectedError',
        payload: 'there a was problme deleting this city',
      });
    }
  }

  // 2) Provide the context value
  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        fetchCurrentCity,
        currentCity,
        createAndPostNewCity,
        DeleteACityFromAPI,
        error,
      }}>
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);
  if (context === undefined) {
    throw new Error('You are using context outside the provider component');
  }
  return context;
}

export { CitiesProvider, useCities };
