import { useCallback, useEffect, useReducer, useRef } from "react";

type State<T> = {
  data?: T;
  error?: string;
  isLoading: boolean;
}

type Cache<T> = { [url: string]: T };

type Action<T> =
  | { type: 'FETCH_INIT' }
  | { type: 'FETCH_SUCCESS'; payload: T }
  | { type: 'FETCH_ERROR'; payload: string }

function useFetch<T> (url: string, options?: RequestInit): State<T> {
  // alternatively you could use localStorage
  const cache = useRef<Cache<T>>({});

  // optional cancelRequest in useHooks repo
  // if the component is unmounted before the data is recovered, the fetch will not be called.

  // we type the return type when there are multiple potential returns,
  // Matt Pocock has a video on youtube I'll link
  const fetchReducer = (state: State<T>, action: Action<T>): State<T> => {
    switch (action.type) {
      case 'FETCH_INIT':
        return { ...state, isLoading: true };
      case 'FETCH_SUCCESS':
        return { ...state, data: action.payload, isLoading: false };
      case 'FETCH_ERROR':
        return { ...state, error: action.payload, isLoading: false };
      default:
        return state;
    }
  }

  const [{ isLoading, error, data }, dispatch] = useReducer(
    fetchReducer,
    {
      error: undefined,
      data: undefined,
      isLoading: false,
    });

  const fetchData = useCallback(async () => {
    dispatch({ type: 'FETCH_INIT' });

    // check cache
    // If a cache exists for this url, return it
    if (cache.current[url]) {
      dispatch({ type: 'FETCH_SUCCESS', payload: cache.current[url] })
      return
    }

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data = await response.json();
      cache.current[url] = data;
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: JSON.stringify(error) });
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { isLoading, error, data };
};

export default useFetch;