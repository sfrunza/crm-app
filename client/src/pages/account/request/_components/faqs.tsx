import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type Faq = {
  id: number;
  question: string;
  answer: string;
};

const faqs: Faq[] = [
  {
    id: 1,
    question: "When is the best time to move?",
    answer:
      "The best time to move is when you need to move!>Brave Movers - Moving & Storage is here to provide you with moving services 7 days a week, right throughout the year. Our busiest time traditionally, as for every moving company, is during the summer months, usually the period between May 15 and September 15. End months are also, understandably, a buzzing.....",
  },
  {
    id: 2,
    question: "How do you book a move with Brave Movers?",
    answer:
      "There are several ways you can book a move with us. You can fill out our online moving quote form book.bravemovers.com, send us an email to info@bravemovers.com or simply give us a call today at (617) 991-3552.",
  },
  {
    id: 3,
    question: "How much do movers cost in Boston?",
    answer:
      "The average charge for a local move in Metro Boston area is about $100 to $130 per hour for a 2 men crew and a moving truck, with all furniture protection materials included (shrink wrap, moving blankets, tape, mattress covers). This cost will vary based on specific moving needs and service days.",
  },
  {
    id: 4,
    question: "Can you leave movers alone?",
    answer:
      "While it's important that you let the movers do their job, it doesn't mean that you leave the site and just wait for them in your new home. They might have other questions or concerns requiring your assistance. Someone has to be there to resolve any issue.",
  },
  {
    id: 5,
    question: "Do we offer packing services?",
    answer:
      "Brave Movers offers full packing as well as partial packing services that can be customized to meet the needs of any move, large or small. Contact your Brave Movers representative at  (617) 991-3552  to discuss your packing needs. We will make every effort to accommodate your packing needs even last minute if you are left behind with packing.",
  },
  {
    id: 6,
    question: "Do I need to be there when the movers arrive?",
    answer:
      "Yes. In case if not possible, we have to have power of attorney addressed to person who will assist us on the moving process.",
  },
  {
    id: 7,
    question: "How can I get moving boxes in Boston?",
    answer:
      "You can try nearest home improvement stores or order a Full Packing Services. Our experienced movers will have all necessary packing materials to pack everything safe and professionally.",
  },
  {
    id: 8,
    question: "How do we charge for services?",
    answer:
      "Our Rates are hourly based with a 15 minutes-increment charge policy. Rates vary depending on the crew size required for your move. Our rates have no hidden fees, and include movers, fully equipped truck, all furniture protection materials, gas, tolls, mileage and basic insurance.We have a 3 hour minimum charge policy.",
  },
  {
    id: 9,
    question: "Are we fully licensed and insured?",
    answer:
      "Brave Movers are fully licensed and insured moving company that can legally operate across the lengths and breadths of The United States of America. Please call our office for more details about our licenses and insurance information.",
  },
  {
    id: 10,
    question: "How far in advance should I schedule movers?",
    answer:
      "As early as you can, especially if you are planning to move in a peak moving season and/or have an exact desireable moving date. Typically 2-3 weeks is enough to reserve the date you want. We also accept early and last minute bookings.",
  },
  {
    id: 11,
    question: "Should you buy moving insurance?",
    answer:
      "While most moving companies offer only basic option of $0.60 per pound for a damaged or lost item, Brave Movers offer value protection up to $10,000 in household goods coverage.",
  },
];

export function Faqs() {
  return (
    <div>
      <h3 className="mb-6 text-xl font-semibold">FAQ's</h3>
      <Accordion type="single" collapsible defaultValue="shipping">
        {faqs.map((faq) => (
          <AccordionItem value={faq.id.toString()} key={faq.id}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
