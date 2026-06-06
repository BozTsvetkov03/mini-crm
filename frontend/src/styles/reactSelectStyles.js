// since you cant apply tailwind styles to react-select directly using className, chatgpt suggested this:

// Factory so the control can adapt to light/dark mode. Pass `isDark` from the
// component (which reads it from ThemeContext) so the styles recompute on toggle.
export const makeSelectStyles = (isDark = false) => ({
  control: (base, state) => ({
    ...base,
    minHeight: "42px",
    borderRadius: "0.75rem",
    borderColor: state.isFocused ? "#34d399" : isDark ? "#374151" : "#d1d5db",
    boxShadow: state.isFocused
      ? `0 0 0 2px ${isDark ? "#064e3b" : "#d1fae5"}`
      : "none",
    "&:hover": {
      borderColor: state.isFocused ? "#34d399" : isDark ? "#374151" : "#d1d5db",
    },
    paddingLeft: "2px",
    backgroundColor: isDark ? "#1f2937" : "white",
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 10px",
  }),
  input: (base) => ({
    ...base,
    margin: "0px",
    padding: "0px",
    color: isDark ? "#f3f4f6" : "#111827",
  }),
  placeholder: (base) => ({
    ...base,
    color: isDark ? "#6b7280" : "#9ca3af",
  }),
  singleValue: (base) => ({
    ...base,
    color: isDark ? "#f3f4f6" : "#111827",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "#6b7280",
    "&:hover": {
      color: isDark ? "#d1d5db" : "#374151",
    },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: "#6b7280",
    "&:hover": {
      color: "#dc2626",
    },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "0.75rem",
    overflow: "hidden",
    zIndex: 20,
    backgroundColor: isDark ? "#1f2937" : "white",
  }),
  menuList: (base) => ({
    ...base,
    paddingTop: 4,
    paddingBottom: 4,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#10b981"
      : state.isFocused
      ? isDark
        ? "#064e3b"
        : "#ecfdf5"
      : isDark
      ? "#1f2937"
      : "white",
    color: state.isSelected ? "white" : isDark ? "#f3f4f6" : "#111827",
    cursor: "pointer",
  }),
});

// Backwards-compatible light styles for any caller that doesn't pass a theme.
export const selectStyles = makeSelectStyles(false);
