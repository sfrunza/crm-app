import type { ComponentProps, ChangeEventHandler } from "react";
import { useEffect, useState } from "react";
import type { Address } from "@/domains/requests/request.types";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { importLibrary } from "@/lib/maps-loader";

interface MyAutocompleteProps extends ComponentProps<"input"> {
  onAddressSelect: (address: Partial<Address>) => void;
}

function parseAddress(components: google.maps.places.AddressComponent[]) {
  let streetNumber = "";
  let route = "";
  let city = "";
  let state = "";
  let zip = "";
  let country = "";

  for (const component of components) {
    const types = component.types;

    if (types.includes("street_number")) {
      streetNumber = component.longText ?? "";
    }

    if (types.includes("route")) {
      route = component.longText ?? "";
    }

    if (types.includes("locality") && !city) {
      city = component.longText ?? "";
    }

    if (types.includes("sublocality_level_1") && !city) {
      city = component.longText ?? "";
    }

    if (types.includes("administrative_area_level_2") && !city) {
      city = component.longText ?? "";
    }

    if (types.includes("administrative_area_level_1")) {
      state = component.shortText ?? "";
    }

    if (types.includes("postal_code")) {
      zip = component.longText ?? "";
    }

    if (types.includes("country")) {
      country = component.shortText ?? "";
    }
  }

  // 🔒 Enforce US-only safety
  if (country && country !== "US") {
    throw new Error("Non-US address detected");
  }

  return {
    street: [streetNumber, route].filter(Boolean).join(" "),
    city,
    state,
    zip,
  };
}

export function MyAutocomplete({
  onAddressSelect,
  value,
  onChange,
  onBlur,
  ...props
}: MyAutocompleteProps) {
  const [inputValue, setInputValue] = useState("");
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<
    Partial<Address>[] | null
  >(null);

  useEffect(() => {
    if (!inputValue || inputValue === "") {
      setAutocompleteSuggestions(null);
      return;
    }

    async function init() {
      const request: google.maps.places.AutocompleteRequest = {
        input: inputValue,
        includedRegionCodes: ["US"],
        // locationRestriction: {
        //   north: 49.38,
        //   south: 24.52,
        //   east: -66.94,
        //   west: -124.77,
        // },
      };

      let addresses: Partial<Address>[] = [];

      try {
        const { AutocompleteSuggestion } = await importLibrary("places");
        const autocompleteResponse =
          await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

        const { suggestions } = autocompleteResponse;

        for (const suggestion of suggestions) {
          const placePrediction = suggestion.placePrediction;
          if (!placePrediction) {
            return null;
          }

          const place = placePrediction.toPlace();
          const fields = await place.fetchFields({
            fields: ["addressComponents", "location"],
          });

          if (!fields.place.addressComponents) {
            throw new Error("No address components found");
          }
          const address = parseAddress(fields.place.addressComponents);

          const addressObj = {
            ...address,
            location: {
              lat: fields.place.location?.lat(),
              lng: fields.place.location?.lng(),
            },
          };

          addresses.push(addressObj as Partial<Address>);
        }

        setAutocompleteSuggestions(addresses);
      } catch (error) {
        console.error("Failed to initialize Google Maps", error);
      }
    }

    init();
  }, [inputValue]);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    onChange?.(event);
    setInputValue(event.target.value);
  };

  // Event handler for clicking on a suggested place.
  // async function onPlaceSelected(place: google.maps.places.Place) {
  //   const fields = await place.fetchFields({
  //     fields: ["addressComponents", "location"],
  //   });

  //   if (!fields.place.addressComponents) {
  //     throw new Error("No address components found");
  //   }
  //   const address = parseAddress(fields.place.addressComponents);

  //   onAddressSelect({
  //     ...address,
  //     location: {
  //       lat: fields.place.location?.lat(),
  //       lng: fields.place.location?.lng(),
  //     },
  //   });
  //   setAutocompleteSuggestions(null);
  //   return null;
  // }

  return (
    <Combobox<google.maps.places.AutocompleteSuggestion>
      items={autocompleteSuggestions ?? []}
      inputValue={value}
      onOpenChange={(nextOpen, details) => {
        if (!nextOpen && details.reason !== "input-change") {
          setAutocompleteSuggestions(null);
        }
      }}
      open={!!autocompleteSuggestions?.length}
      filter={null}
      itemToStringLabel={(item) =>
        item?.placePrediction?.text?.toString?.() ?? ""
      }
    >
      <ComboboxInput
        showTrigger={false}
        autoComplete="off"
        value={value}
        onChange={handleChange}
        {...props}
      />
      <ComboboxContent>
        <ComboboxEmpty>No suggestions yet.</ComboboxEmpty>
        <ComboboxList>
          {(item: Partial<Address>) => {
            const { street, city, state, zip } = item;
            return (
              <ComboboxItem
                key={`${street}-${city}-${state}-${zip}`}
                value={`${street}-${city}-${state}-${zip}`}
                onClick={async (e) => {
                  e.stopPropagation();
                  onAddressSelect(item);
                }}
                className="items-start gap-1 truncate text-xs"
              >
                {/* Location icon */}
                <div className="mt-0.5 text-muted-foreground">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
                  </svg>
                </div>

                {/* Address text */}
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{street}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {city}, {state} {zip}
                  </div>
                </div>
              </ComboboxItem>
            );
          }}
        </ComboboxList>
        <PoweredByGoogle />
      </ComboboxContent>
    </Combobox>
  );
}

function PoweredByGoogle() {
  return (
    <div className="flex items-center justify-end px-2 py-1">
      <svg height="16" viewBox="0 0 90 16" aria-label="Powered by Google">
        <text
          x="0"
          y="12"
          fontFamily="--var(font-sans)"
          fill="#6B7280"
          fontSize="10"
        >
          powered by
        </text>

        <text x="57" y="12" fontSize="10" fontFamily="--var(font-sans)">
          <tspan fill="#4285F4">G</tspan>
          <tspan fill="#DB4437">o</tspan>
          <tspan fill="#F4B400">o</tspan>
          <tspan fill="#4285F4">g</tspan>
          <tspan fill="#0F9D58">l</tspan>
          <tspan fill="#DB4437">e</tspan>
        </text>
      </svg>
    </div>
  );
}
