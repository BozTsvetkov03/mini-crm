// since you cant apply tailwind styles to react-select directly using className, chatgpt suggested this:

export const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "42px",
    borderRadius: "0.75rem",
    borderColor: state.isFocused ? "#34d399" : "#d1d5db",
    boxShadow: state.isFocused ? "0 0 0 2px #d1fae5" : "none",
    "&:hover": {
      borderColor: state.isFocused ? "#34d399" : "#d1d5db",
    },
    paddingLeft: "2px",
    backgroundColor: "white",
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 10px",
  }),
  input: (base) => ({
    ...base,
    margin: "0px",
    padding: "0px",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#9ca3af",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#111827",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "#6b7280",
    "&:hover": {
      color: "#374151",
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
      ? "#ecfdf5"
      : "white",
    color: state.isSelected ? "white" : "#111827",
    cursor: "pointer",
  }),
};