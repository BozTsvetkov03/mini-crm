// react-select can't take Tailwind classes, so its styles reference the same
// CSS design tokens (var(--…) from index.css) that the utilities are built
// from — they flip with .dark automatically, no theme prop needed.

export const makeSelectStyles = () => ({
  control: (base, state) => ({
    ...base,
    minHeight: "42px",
    borderRadius: "0.75rem",
    borderColor: state.isFocused ? "var(--primary)" : "var(--line-strong)",
    boxShadow: state.isFocused ? "0 0 0 2px var(--ring)" : "none",
    "&:hover": {
      borderColor: state.isFocused ? "var(--primary)" : "var(--line-strong)",
    },
    paddingLeft: "2px",
    backgroundColor: "var(--field)",
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 10px",
  }),
  input: (base) => ({
    ...base,
    margin: "0px",
    padding: "0px",
    color: "var(--ink)",
  }),
  placeholder: (base) => ({
    ...base,
    color: "var(--ink-faint)",
  }),
  singleValue: (base) => ({
    ...base,
    color: "var(--ink)",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "var(--ink-muted)",
    "&:hover": {
      color: "var(--ink)",
    },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: "var(--ink-muted)",
    "&:hover": {
      color: "var(--danger)",
    },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "0.75rem",
    overflow: "hidden",
    zIndex: 20,
    backgroundColor: "var(--field)",
  }),
  menuList: (base) => ({
    ...base,
    paddingTop: 4,
    paddingBottom: 4,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "var(--primary-strong)"
      : state.isFocused
        ? "color-mix(in oklab, var(--primary) 15%, transparent)"
        : "var(--field)",
    color: state.isSelected ? "var(--background)" : "var(--ink)",
    cursor: "pointer",
  }),
});

// Backwards-compatible export; the param is no longer needed since the
// tokens flip with the .dark class on <html>.
export const selectStyles = makeSelectStyles();
