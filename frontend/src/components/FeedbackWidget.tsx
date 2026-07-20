import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Check, ChevronsUpDown, MessageSquarePlus } from "lucide-react";
import { toast } from "react-toastify";
import { createFeedback } from "@/api/mutations/feedbackMutate";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import type { IApiError } from "@/types/IApi";
import type {
  ICreateFeedbackData,
  ICreateFeedbackResponse,
} from "@/types/IFeedback";
import {
  FEEDBACK_MESSAGE_MAX_LENGTH,
  FEEDBACK_TYPE_VALUES,
  feedbackTypeLabels,
  type FeedbackType,
} from "@/utils/constants/feedback";
import { cn } from "@/lib/utils";

const OPEN_FEEDBACK_EVENT = "entrelivros:open-feedback";

const BUG_PLACEHOLDER =
  "O que aconteceu?\nO que você esperava?\nComo reproduzir?";

const DEFAULT_PLACEHOLDER =
  "Conte o que pensa — sugestão, dúvida ou comentário.";

type FeedbackFormValues = {
  type: FeedbackType | "";
  message: string;
};

export function openFeedbackDialog() {
  window.dispatchEvent(new Event(OPEN_FEEDBACK_EVENT));
}

export function FeedbackWidget() {
  const { isLoggedIn } = useAuth();
  const [open, setOpen] = useState(false);
  const [typeComboboxOpen, setTypeComboboxOpen] = useState(false);

  useEffect(() => {
    const handleOpenFeedback = () => setOpen(true);
    window.addEventListener(OPEN_FEEDBACK_EVENT, handleOpenFeedback);
    return () => {
      window.removeEventListener(OPEN_FEEDBACK_EVENT, handleOpenFeedback);
    };
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FeedbackFormValues>({
    defaultValues: {
      type: "",
      message: "",
    },
  });

  const selectedType = watch("type");
  const messageValue = watch("message");

  const { mutate, isPending } = useMutation<
    ICreateFeedbackResponse,
    IApiError,
    ICreateFeedbackData
  >({
    mutationFn: createFeedback,
    onSuccess: (result) => {
      toast.success(result.message || "Feedback enviado com sucesso!");
      reset({ type: "", message: "" });
      setTypeComboboxOpen(false);
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar feedback");
    },
  });

  if (!isLoggedIn) {
    return null;
  }

  const onSubmit: SubmitHandler<FeedbackFormValues> = (data) => {
    if (!data.type) {
      return;
    }
    mutate({
      type: data.type,
      message: data.message.trim(),
      pageUrl: window.location.href,
    });
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (isPending) {
      return;
    }
    setOpen(nextOpen);
    if (!nextOpen) {
      setTypeComboboxOpen(false);
      reset({ type: "", message: "" });
    }
  };

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "fixed z-40 hidden gap-2 shadow-md lg:inline-flex",
          "bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))]",
        )}
        aria-label="Enviar feedback"
      >
        <MessageSquarePlus className="size-4" />
        Feedback
      </Button>

      <ResponsiveDialog open={open} onOpenChange={handleOpenChange}>
        <ResponsiveDialogContent className="sm:max-w-md">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <ResponsiveDialogHeader className="gap-1">
              <ResponsiveDialogTitle className="text-2xl text-primary">
                Feedback
              </ResponsiveDialogTitle>
              <ResponsiveDialogDescription className="text-warm-brown">
                Sugira melhorias, reporte bugs ou deixe um comentário sobre o
                produto.
              </ResponsiveDialogDescription>
            </ResponsiveDialogHeader>

            <ResponsiveDialogBody className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Tipo
                </label>
                <Popover
                  open={typeComboboxOpen}
                  onOpenChange={setTypeComboboxOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={typeComboboxOpen}
                      className="w-full justify-between font-normal"
                    >
                      {selectedType ? (
                        <span className="text-foreground">
                          {feedbackTypeLabels[selectedType]}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          Selecione o tipo...
                        </span>
                      )}
                      <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-(--radix-popover-trigger-width) p-0"
                    align="start"
                  >
                    <Command>
                      <CommandList>
                        <CommandEmpty>Nenhum tipo encontrado.</CommandEmpty>
                        <CommandGroup>
                          {FEEDBACK_TYPE_VALUES.map((feedbackType) => (
                            <CommandItem
                              key={feedbackType}
                              value={`${feedbackType} ${feedbackTypeLabels[feedbackType]}`}
                              onSelect={() => {
                                setValue("type", feedbackType, {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                });
                                setTypeComboboxOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "size-4",
                                  selectedType === feedbackType
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {feedbackTypeLabels[feedbackType]}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <input
                  type="hidden"
                  {...register("type", {
                    required: "Selecione o tipo de feedback.",
                  })}
                />
                {errors.type && (
                  <p className="text-xs text-primary">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="feedback-message"
                  className="text-sm font-medium text-foreground"
                >
                  Mensagem
                </label>
                <textarea
                  id="feedback-message"
                  rows={5}
                  maxLength={FEEDBACK_MESSAGE_MAX_LENGTH}
                  placeholder={
                    selectedType === "bug" ? BUG_PLACEHOLDER : DEFAULT_PLACEHOLDER
                  }
                  className="w-full resize-y rounded-lg border-2 border-secondary bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  {...register("message", {
                    required: "Escreva sua mensagem.",
                    validate: (value) =>
                      value.trim().length > 0 || "Escreva sua mensagem.",
                    maxLength: {
                      value: FEEDBACK_MESSAGE_MAX_LENGTH,
                      message: `A mensagem pode ter no máximo ${FEEDBACK_MESSAGE_MAX_LENGTH} caracteres.`,
                    },
                  })}
                />
                {errors.message && (
                  <p className="text-xs text-primary">{errors.message.message}</p>
                )}
                {(messageValue?.length ?? 0) >=
                  FEEDBACK_MESSAGE_MAX_LENGTH - 200 && (
                  <p className="text-xs text-muted-foreground text-right">
                    {messageValue?.length ?? 0}/{FEEDBACK_MESSAGE_MAX_LENGTH}
                  </p>
                )}
              </div>
            </ResponsiveDialogBody>

            <ResponsiveDialogFooter className="mt-4 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => handleOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Enviando..." : "Enviar"}
              </Button>
            </ResponsiveDialogFooter>
          </form>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </>
  );
}
