import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import type { Request } from "@/domains/requests/request.types";
import { CircleQuestionMarkIcon } from "@/components/icons";
import { useEffect } from "react";

type Question = {
  id: number;
  name:
    | "delicate_items_question_answer"
    | "bulky_items_question_answer"
    | "disassemble_items_question_answer";
  question: string;
};

const questions: Question[] = [
  {
    id: 1,
    name: "delicate_items_question_answer",
    question:
      "Do you have items that easily break and need extra love (lamps, mirrors, electronics, artwork)?",
  },
  {
    id: 2,
    name: "bulky_items_question_answer",
    question:
      "Do you have bulky items that require added handling? (e.g armoires, ellipticals, treadmills, appliances)",
  },
  {
    id: 3,
    name: "disassemble_items_question_answer",
    question: "Do you have items that we'll need to disassemble for you?",
  },
];

const formSchema = z.object({
  delicate_items_question_answer: z.string(),
  bulky_items_question_answer: z.string(),
  disassemble_items_question_answer: z.string(),
  comments: z.string(),
});

type Inputs = z.infer<typeof formSchema>;

interface DetailsFormProps {
  formId: "details-form";
  details: Request["details"];
  onSave: (values: Inputs) => void;
  className?: string;
  disabled?: boolean;
  setHasChanges?: (hasChanges: boolean) => void;
}

export function DetailsForm({
  formId,
  details,
  onSave,
  className,
  disabled,
  setHasChanges,
}: DetailsFormProps) {
  const form = useForm<Inputs>({
    resolver: zodResolver(formSchema),
    reValidateMode: "onChange",
    values: {
      delicate_items_question_answer:
        details?.delicate_items_question_answer ?? "",
      bulky_items_question_answer: details?.bulky_items_question_answer ?? "",
      disassemble_items_question_answer:
        details?.disassemble_items_question_answer ?? "",
      comments: details?.comments ?? "",
    },
  });

  function handleSaveChanges(values: Inputs) {
    onSave(values);
  }

  useEffect(() => {
    setHasChanges?.(form.formState.isDirty);
  }, [form.formState.isDirty, setHasChanges, form.formState.isDirty]);

  return (
    <div className={className}>
      <form id={formId} onSubmit={form.handleSubmit(handleSaveChanges)}>
        <FieldGroup className="gap-4 divide-y">
          {questions.map((q) => (
            <Controller
              key={q.id}
              name={q.name}
              control={form.control}
              render={({ field }) => (
                <FieldSet className="pb-2" disabled={disabled}>
                  <div className="flex items-start justify-between gap-3">
                    <FieldLegend
                      variant="label"
                      className="min-w-0 font-normal"
                    >
                      <span className="text-muted-foreground flex gap-2">
                        <CircleQuestionMarkIcon className="mt-0.5 size-4 shrink-0" />
                        <span className="text-sm leading-5">{q.question}</span>
                      </span>
                    </FieldLegend>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex w-fit gap-2"
                    >
                      <FieldLabel
                        htmlFor={`${q.id}-yes`}
                        className="text-xs *:data-[slot=field]:p-1.5"
                      >
                        <Field orientation="horizontal" className="gap-1">
                          <div className="font-medium">Yes</div>
                          <RadioGroupItem
                            value="yes"
                            id={`${q.id}-yes`}
                            className="size-3 after:-inset-x-2 after:-inset-y-1.5 [&_[data-slot=radio-group-indicator]_span]:size-1.5"
                          />
                        </Field>
                      </FieldLabel>
                      <FieldLabel
                        htmlFor={`${q.id}-no`}
                        className="text-xs *:data-[slot=field]:p-1.5"
                      >
                        <Field orientation="horizontal" className="gap-1">
                          <div className="font-medium">No</div>
                          <RadioGroupItem
                            value="no"
                            id={`${q.id}-no`}
                            className="size-3 after:-inset-x-2 after:-inset-y-1.5 [&_[data-slot=radio-group-indicator]_span]:size-1.5"
                          />
                        </Field>
                      </FieldLabel>
                    </RadioGroup>
                  </div>
                </FieldSet>
              )}
            />
          ))}
          <Controller
            name="comments"
            control={form.control}
            render={({ field }) => (
              <FieldSet disabled={disabled}>
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    Additional comments
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    placeholder="Enter your comment..."
                    autoComplete="off"
                    className="min-h-30"
                  />
                </Field>
              </FieldSet>
            )}
          />
        </FieldGroup>
      </form>
    </div>
  );
}
