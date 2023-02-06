import { useEffect, useReducer, useRef } from "react";

type State<T> = {
  data?: T;
  error?: Error;
}

type Cache<T> = { [url: string]: T };

type Action<T> =
  | { type: 'loading' }
  | { type: 'fetched'; payload: T }
  | { type: 'error'; payload: Error }

function useFetch<T> (url?: string, options?: RequestInit): State<T> {
  const cache = useRef<Cache<T>>({});

  // used to prevent state update if the component is unmounted
  const cancelRequest = useRef(false);

  const initialState = {
    error: undefined,
    data: undefined,
  };

  // we type the return type when there are multiple potential returns,
  // Matt Pocock has a video on youtube I'll link
  const fetchReducer = (state: State<T>, action: Action<T>): State<T> => {
    switch (action.type) {
      case 'loading':
        return { ...initialState };
      case 'fetched':
        return { ...initialState, data: action.payload };
      case 'error':
        return { ...initialState, error: action.payload };
      default:
        return state;
    }
  }

  const [state, dispatch] = useReducer(fetchReducer, initialState);

  useEffect(() => {
    if (!url) return;

    // reset just in case it is still true
    cancelRequest.current = false;

    const fetchData = async () => {
      dispatch({ type: 'loading' });

      // if this url has a cache return it
      if (cache.current[url]) {
        dispatch({ type: 'fetched', payload: cache.current[url] });
        return;
      }

      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(response.statusText);
        }

        const data = await response.json() as T;
        cache.current[url] = data;
        if (cancelRequest.current) return;

        dispatch({ type: 'fetched', payload: data });
      } catch (error) {
        if (cancelRequest.current) return;

        dispatch({ type: 'error', payload: error as Error});
      }
    }

    fetchData();

    return () => {
      cancelRequest.current = true;
    }
  }, [url, options]);

  return state;
};

export default useFetch;