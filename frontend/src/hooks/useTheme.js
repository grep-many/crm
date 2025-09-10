// src/hooks/useTheme.js
import { useDispatch, useSelector } from "react-redux";
import { setTheme } from "../redux/themeSlice";

export const useTheme = () => {
  const theme = useSelector((state) => state.theme.theme);
  const dispatch = useDispatch();

  const toggleTheme = (themeValue) => {
    dispatch(setTheme(themeValue)); // "light", "dark", or "system"
  };

  return { theme, toggleTheme };
};
