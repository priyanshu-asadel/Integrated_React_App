import { createContext, useContext, useState } from 'react';

// Common Context for shared UI state
const CommonContext = createContext(null);

export const CommonProvider = ({ children }) => {
  const [isShrunk, setIsShrunk] = useState(false);

  return (
    <CommonContext.Provider value={{ isShrunk, setIsShrunk }}>
      {children}
    </CommonContext.Provider>
  );
};

export const useCommon = () => useContext(CommonContext);