import { PropsWithChildren, createContext, useState } from 'react';

interface AppContextValue {
  highCont: boolean;
  screenRead: boolean;
  handleHighCont: () => void;
  handleScreenRead: () => void;
}

const AppContext = createContext<AppContextValue>({} as AppContextValue);

const AppContextProvider = ({ children }: PropsWithChildren<{}>) => {
  const [highCont, setHighCont] = useState(true);
  const [screenRead, setScreenRead] = useState(false);
  
  const handleHighCont = () => {
    setHighCont(!highCont);
  };

  const handleScreenRead = () => {
    setScreenRead(!screenRead);
  };

  return <AppContext.Provider value={{ highCont, screenRead, handleHighCont, handleScreenRead}}>{children}</AppContext.Provider>;
};

export { AppContext, AppContextProvider };
