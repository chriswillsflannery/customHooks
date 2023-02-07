import { useCallback, useEffect, useReducer } from "react";

type State<T> = {
  data?: T;
  error?: Error;
  isLoading: boolean;
}

type Action<T> =
| { type: 'FETCH_INIT' }
| { type: 'FETCH_SUCCESS'; payload: T }
| { type: 'FETCH_ERROR'; payload: Error }

// alternatively you could use localStorage
// const cache: { [url: string]: any } = ({});

// we type the return type when there are multiple potential returns,
// Matt Pocock has a video on youtube I'll link
function fetchReducer<T> (state: State<T>, action: Action<T>): State<T> {
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

function useFetch<T> (url: string, options?: RequestInit): State<T> {
  // optional cancelRequest in useHooks repo
  // if the component is unmounted before the data is recovered, the fetch will not be called.

  const [{ isLoading, error, data }, dispatch] = useReducer(
    fetchReducer<T>,
    {
      error: undefined,
      data: undefined,
      isLoading: false,
    });

  // define fetchData outside of useFetch 
  // in the future, we could extend it for advanced caching, refetching, cache invalidation etc.
  const fetchData = useCallback(async () => {
    dispatch({ type: 'FETCH_INIT' });

    // check cache
    // If a cache exists for this url, return it
    // if (cache.current[url]) {
    //   dispatch({ type: 'FETCH_SUCCESS', payload: cache.current[url] })
    //   return
    // }

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data = await response.json();
      // cache.current[url] = data;
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error as Error });
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { isLoading, error, data };
};

export default useFetch;