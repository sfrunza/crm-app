import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import type { Status } from '@/domains/requests/request.types';
import { useRequest } from '@/hooks/use-request';
import { formatDate } from '@/lib/format-date';
import { formatPhone } from '@/lib/format-phone';
import {
  Calendar1Icon,
  CheckCircleIcon,
  MailIcon,
  MessageCircleIcon,
  PhoneIcon,
} from '@/components/icons';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Confetti } from './_components/confetti';
import { useSettings } from '@/hooks/api/use-settings';

const ALLOWED_STATUSES: Status[] = ['confirmed', 'reserved'];

function ReservationConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { request, isPending, isError } = useRequest(Number(id));
  const { data: companySettings } = useSettings();

  const companyPhone = companySettings?.company_phone;
  const companyEmail = companySettings?.company_email;

  const handleBackToRequest = () => {
    navigate(`/account/requests/${id}`);
  };

  // Redirect if request doesn't have allowed status
  useEffect(() => {
    if (request && !ALLOWED_STATUSES.includes(request.status)) {
      navigate(`/account/requests/${id}`, { replace: true });
    }
  }, [request, navigate, id]);

  if (!request || isPending || isError) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <Confetti />
      <Card className="mx-auto w-full max-w-lg text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircleIcon className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">
              Congratulations!
            </CardTitle>
            <CardDescription className="text-lg">
              Your move is reserved and scheduled
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Thank you for your payment. Your reservation has been confirmed and
            we're looking forward to helping you move!
          </p>

          {request?.moving_date && (
            <div className="bg-primary/10 border-primary/20 rounded-xl border p-4">
              <p className="text-primary flex items-center justify-center gap-2 font-semibold">
                <Calendar1Icon className="size-5" />
                See you on {formatDate(request.moving_date)}
              </p>
            </div>
          )}

          {/* ── Back to Request ───────────────────────────────────── */}
          {/* <div className="flex flex-col gap-2 pt-4"> */}
          <Button onClick={handleBackToRequest} size="lg">
            Back to Request Page
          </Button>
          {/* </div> */}

          {/* ── What's Next? ───────────────────────────────────── */}
          <div className="bg-muted/50 rounded-xl border p-4 text-left">
            <h3 className="mb-3 flex items-center gap-2 font-semibold">
              <MailIcon className="h-5 w-5" />
              What's Next?
            </h3>
            <ul className="text-muted-foreground list-disc space-y-2 pl-4 text-sm">
              <li>
                <span>
                  You will receive an email notification{' '}
                  <strong>5 days before</strong> your move with final details
                  and preparations
                </span>
              </li>
              <li>
                <span>
                  A reminder email will be sent <strong>1 day before</strong>{' '}
                  your move with your crew assignment and arrival time
                </span>
              </li>
              <li>
                <span>
                  Our moving team will arrive on time and ready to make your
                  move smooth and stress-free
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-muted/50 rounded-xl border p-4 text-left">
            <h3 className="mb-3 flex items-center gap-2 font-semibold">
              <MessageCircleIcon className="h-5 w-5" />
              Have Questions?
            </h3>
            <p className="text-muted-foreground mb-3 text-sm">
              Our team is here to help! If you have any questions or need to
              make changes to your reservation, don't hesitate to reach out.
            </p>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground flex items-center gap-2">
                <PhoneIcon className="size-4" />
                Call us at
                <a
                  href={`tel:${companyPhone}`}
                  className="text-primary hover:underline"
                >
                  {formatPhone(companyPhone)}
                </a>
              </p>
              <p className="text-muted-foreground flex items-center gap-2">
                <MailIcon className="size-4" />
                Email us at
                <a
                  href={`mailto:${companyEmail}`}
                  className="text-primary hover:underline"
                >
                  {companyEmail}
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export const Component = ReservationConfirmationPage;
