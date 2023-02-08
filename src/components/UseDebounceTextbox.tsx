import useDebounce from '@/hooks/useDebounce';
import React, { useState, useEffect } from 'react';

export const UseDebounceTextbox = () => {
  const [inputText, setInputText] = useState('');
  const [isDebounced, setIsDebounced] = useState(false);
  const [outputText, setOutputText] = useState('');
  const debouncedValue = useDebounce(inputText, 1000);

  useEffect(() => {
    setIsDebounced(false);
    setOutputText(debouncedValue);
  }, [debouncedValue])

  return (
    <>
      <input
        type="textbox"
        onChange={(e) => {
          setIsDebounced(true);
          setInputText(e.target.value)
        }}
      />
      <div>
        {isDebounced ? 'waiting...' : outputText}
      </div>
    </>
  );
}