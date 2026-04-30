import { format, parseISO, isValid, addDays, differenceInDays } from 'date-fns'

export type DateInput = Date | string | number | null | undefined

export function formatDate(
  value: DateInput,
  formatStr: string = 'MMM d, yyyy'
): string {
  if (!value) return 'TBD'

  let date: Date

  // console.log(value);

  if (value instanceof Date) {
    date = value
  } else if (typeof value === 'string') {
    date = parseISO(value)
  } else {
    date = new Date(value)
  }

  if (!isValid(date)) return 'TBD'

  return format(date, formatStr)
}


export function parseDateOnly(value?: string | null): Date | undefined {
  if (!value) return undefined

  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, month - 1, day)
}

export { addDays, differenceInDays }