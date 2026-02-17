import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

type StoreContextValue = {
  isEnabledVibration: boolean;
  setIsEnabledVibration: React.Dispatch<React.SetStateAction<boolean>>;

  isEnabledSound: boolean;
  setIsEnabledSound: React.Dispatch<React.SetStateAction<boolean>>;

  isEnabledNotifications: boolean;
  setIsEnabledNotifications: React.Dispatch<React.SetStateAction<boolean>>;

  winClick: () => void;
  loseClick: () => void;
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
