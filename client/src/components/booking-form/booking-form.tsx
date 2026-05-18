import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"

export function BookingForm() {
  return (
    <div>
      <div className="mx-auto max-w-7xl py-10">
        <Card className="mx-auto w-full max-w-sm">
          <CardHeader>
            <CardTitle>Booking Form</CardTitle>
            <CardDescription>This is the booking form</CardDescription>
          </CardHeader>
          <CardContent>This is the booking form</CardContent>
        </Card>
      </div>
    </div>
  )
}
