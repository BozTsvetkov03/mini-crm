import Select from "react-select";
import { useMemo } from "react";
import { getNames } from "country-list";
import { selectStyles } from "../styles/reactSelectStyles";

const formatCountryName = (name) => {
  const cleaned = name.replace(/\s*\(the\)/gi, "");

  const customMap = {
    "United States of America": "United States",
    "United Kingdom of Great Britain and Northern Ireland": "United Kingdom",
  };

  return customMap[cleaned] || cleaned;
};

function CountrySelect({ value, onChange }) {
  const countryOptions = useMemo(() => {
    const preferredCountry = "Bulgaria";

    const formatted = getNames()
      .map((countryName) => {
        const formattedName = formatCountryName(countryName);
        return {
          value: formattedName,
          label: formattedName,
        };
      })
      .filter(
        (option, index, arr) =>
          arr.findIndex((x) => x.value === option.value) === index
      )
      .sort((a, b) => a.label.localeCompare(b.label));

    const preferred = formatted.find(
      (option) => option.label === preferredCountry
    );

    const rest = formatted.filter(
      (option) => option.label !== preferredCountry
    );

    return preferred ? [preferred, ...rest] : formatted;
  }, []);

  const selectedOption =
    countryOptions.find((option) => option.label === value) || null;

  return (
    <Select
      options={countryOptions}
      value={selectedOption}
      onChange={(selected) => onChange(selected ? selected.label : "")}
      placeholder="Select country"
      isSearchable
      isClearable
      noOptionsMessage={() => "No country found"}
      styles={selectStyles}
    />
  );
}

export default CountrySelect;