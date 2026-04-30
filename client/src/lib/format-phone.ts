// import parsePhoneNumberFromString, { AsYouType } from "libphonenumber-js";

// const COUNTRY = "US";

// function formatPhone(value: string | undefined): string {
//   if (!value) return "";
//   const phoneNumber = parsePhoneNumberFromString(value, COUNTRY)
//   return phoneNumber ? phoneNumber.formatNational() : value
// }



// export { formatPhone, AsYouType, COUNTRY };

import parsePhoneNumberFromString, { AsYouType } from "libphonenumber-js"

export const COUNTRY = "US"

export function formatPhone(
  value?: string | null,
  options?: { international?: boolean }
): string {
  if (!value) return ""

  const trimmed = value.trim()
  if (!trimmed) return ""

  const phoneNumber = parsePhoneNumberFromString(trimmed, COUNTRY)
  if (!phoneNumber) return value

  return options?.international
    ? phoneNumber.formatInternational()
    : phoneNumber.formatNational()
}

export { AsYouType }
