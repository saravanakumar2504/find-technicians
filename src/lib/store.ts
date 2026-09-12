import { configureStore } from '@reduxjs/toolkit';
import techniciansReducer from './features/technicians/techniciansSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      technicians: techniciansReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
