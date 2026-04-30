import { useSettings } from "@/hooks/api/use-settings"
import { formatPhone } from "@/lib/format-phone"

export function WhatsNext() {
  const { data: settings } = useSettings()
  const companyPhone = settings?.company_phone ?? ""
  return (
    <div className="">
      <h3 className="mb-6 text-xl font-semibold">What's Next?</h3>
      <ul className="list-disc space-y-2 pl-4">
        <li>
          <span>
            After we check our availability you will receive confirmation link.
          </span>
        </li>
        <li>
          <span>
            Meanwhile, you can change information on your request: add inventory
            and your move details. Those will help us to provide a more accurate
            quote.
          </span>
        </li>
        <li>
          <span>
            Contact us if you have any questions. We are here to make sure you
            will have the perfect move.
            <br />
            <strong>
              Our direct phone number: {formatPhone(companyPhone)}
            </strong>
          </span>
        </li>
      </ul>
    </div>
  )
}
