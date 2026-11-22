import { useCallback, useEffect, useState } from 'react';

/** Runs an async loader on mount; returns { data, error, loading, reload }. */
export default function useLoad(fn) {
  const [state, setState] = useState({ data: null, error: '', loading: true });
  const reload = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    try { setState({ data: await fn(), error: '', loading: false }); }
    catch (e) { setState({ data: null, error: e.message, loading: false }); }
  }, [fn]);
  useEffect(() => { reload(); }, [reload]);
  return { ...state, reload };
}
