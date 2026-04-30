class InvoiceMailer < ApplicationMailer
  default from: -> { Setting.company_email }

  def send_invoice(invoice)
    @invoice = invoice
    @request = invoice.request
    @company_name = Setting.company_name
    @company_address = Setting.company_address
    @company_phone = Setting.company_phone
    @company_email = Setting.company_email
    @payment_url = invoice.public_url

    mail(
      to: invoice.email,
      subject: "Invoice #{invoice.invoice_number} from #{@company_name}"
    )
  end
end
