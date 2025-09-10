import { createSlice } from "@reduxjs/toolkit";

// Get theme from localStorage or default to "system"
const initialTheme = localStorage.getItem("crm-ui-theme") || "system";

// Function to apply theme class to <html>
const applyThemeClass = (themeValue) => {
  const root = window.document.documentElement;
  root.classList.remove("light", "dark");

  if (themeValue === "system") {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    root.classList.add(systemTheme);
  } else {
    root.classList.add(themeValue);
  }
};

// Apply initial theme immediately on load
if (typeof window !== "undefined") {
  applyThemeClass(initialTheme);
}

const themeSlice = createSlice({
  name: "theme",
  initialState: {
    theme: initialTheme, // "light" | "dark" | "system"
  },
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem("crm-ui-theme", action.payload);

      applyThemeClass(action.payload);
    },
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;