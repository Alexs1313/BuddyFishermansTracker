// context for storing global state related to the app, such as whether notifications are enabled or not, and any other settings that might be added in the future, also provides a provider component that wraps the app and allows access to the context values from any component in the app

import React, {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from 'react';

type StoreContextValue = {
  isEnabledNotifications: boolean;
  setIsEnabledNotifications: React.Dispatch<React.SetStateAction<boolean>>;
};

export const StoreContext = createContext<StoreContextValue | undefined>(
  undefined,
);

export const useStorage = (): StoreContextValue => {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('err');
  }
  return ctx;
};

export const StorageProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [isEnabledNotifications, setIsEnabledNotifications] =
    useState<boolean>(false);

  const values = {
    isEnabledNotifications,
    setIsEnabledNotifications,
  } as StoreContextValue;

  return (
    <StoreContext.Provider value={values}>{children}</StoreContext.Provider>
  );
};
