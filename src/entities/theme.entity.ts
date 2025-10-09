import { entity, persistence } from "simpler-state";
import { remoteStorage } from "./entityHelpers";

interface IThemeEntity {
  isDarkMode: boolean;
}

const defaultState: IThemeEntity = {
  isDarkMode: true,
};

export const themeEntity = entity(defaultState, [
  persistence("twikklTheme", {
    storage: remoteStorage,
    serializeFn: (val) => JSON.stringify(val),
    deserializeFn: (val) => (val === "null" ? defaultState : JSON.parse(val)),
  }),
]);

export const toggleTheme = () =>
  themeEntity.set((current) => ({
    isDarkMode: !current.isDarkMode,
  }));

export const setTheme = (isDarkMode: boolean) =>
  themeEntity.set({ isDarkMode });

export const useThemeMode = () => {
  const theme = themeEntity.use();
  return {
    isDarkMode: theme.isDarkMode,
    toggleTheme,
    setTheme,
  };
};
