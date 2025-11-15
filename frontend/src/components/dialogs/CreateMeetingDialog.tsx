import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { toast } from "react-toastify";
import { useClub } from "../../contexts/ClubContext";
import type { IMeetingPayload, MeetingStatus } from "@//types/IMeetings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Calendar } from "../ui/calendar";
import { meetingStatusLabels } from "@//utils/meetingStatusHelper";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ChevronDownIcon } from "lucide-react";
import React from "react";
import { Input } from "../ui/input";
import { useBook } from "@//contexts/BookContext";
import { useMutation } from "@tanstack/react-query";
import type { IApiError } from "@//types/IApi";
import { createMeeting } from "@//api/mutations/meetingMutate";

interface CreateMeetingDialogProps {
  openDialog: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ICreateMeetingForm {
  location: string;
  meetingDate: Date;
  meetingTime: string;
  description?: string;
  status: MeetingStatus;
  bookId: string;
}

const CreateMeetingDialog = ({
  openDialog,
  onOpenChange,
}: CreateMeetingDialogProps) => {
  const { selectedClubId } = useClub();
  const [open, setOpen] = React.useState(false);
  const { booksFromSelectedClub } = useBook();

  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: {},
  } = useForm<ICreateMeetingForm>({
    defaultValues: {
      location: "",
      meetingDate: undefined,
      meetingTime: "",
      description: "",
      status: undefined,
      bookId: undefined,
    },
  });

  const { mutate: createMeetingMutate } = useMutation<
    any,
    IApiError,
    IMeetingPayload
  >({
    mutationFn: createMeeting,
    onSuccess: async (result) => {
      console.log(result);
      //queryClient.invalidateQueries({ queryKey: ["userClubs", user?.id] });
      reset();
      onOpenChange(false);
      toast.success("Encontro marcado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Email ou senha incorretos");
    },
  });

  const onSubmit: SubmitHandler<ICreateMeetingForm> = (data) => {
    if (!selectedClubId) {
      toast.error("Você não pode adicionar um livro sem estar em um clube");
      return;
    }

    const { bookId, description, location, meetingDate, meetingTime, status } =
      data;
    
    const [hours, minutes] = meetingTime.split(':').map(Number);
    const timeObject = new Date(); 
    timeObject.setHours(hours, minutes, 0, 0);

    createMeetingMutate({
      bookId,
      description,
      location,
      meetingDate,
      meetingTime: timeObject,
      status,
      clubId: selectedClubId,
    });
  };

  return (
    <Dialog open={openDialog} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] lg:max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader className="gap-0 mb-4">
            <DialogTitle className="text-3xl text-primary">
              Marcar encontro
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div>
              <h3 className="text-lg font-medium mb-1">Onde:</h3>
              <Input
                {...register("location", { required: true })}
                placeholder="Aroma Café"
                className="border-2 border-secondary rounded-md p-2 w-full text-foreground bg-background"
              />
            </div>
            <div className="flex flex-row justify-between gap-3">
              <div className="w-full">
                <h3 className="text-lg font-medium mb-1">Quando:</h3>
                <Controller
                  name="meetingDate"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          id="date-picker"
                          className="w-full justify-between font-normal"
                        >
                          {field.value
                            ? field.value.toLocaleDateString("pt-BR")
                            : "Selecione a data"}
                          <ChevronDownIcon />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto overflow-hidden p-0"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            setOpen(false);
                          }}
                          className="rounded-lg border [--cell-size:--spacing(11)] md:[--cell-size:--spacing(12)]"
                          buttonVariant="ghost"
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>
              <div className="w-full">
                <h3 className="text-lg font-medium mb-1">Horário:</h3>
                <Input
                  type="time"
                  {...register("meetingTime", { required: true })}
                  id="time-picker"
                  step="0"
                  defaultValue="10:30"
                  className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-1">Status:</h3>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full border-2 border-secondary text-md py-5 cursor-pointer">
                      <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                    <SelectContent className="border-secondary bg-background rounded-lg">
                      {Object.entries(meetingStatusLabels).map(
                        ([statusKey, statusLabel]) => (
                          <SelectItem
                            key={statusKey}
                            value={statusKey}
                            className="cursor-pointer text-md p-3"
                          >
                            {statusLabel}{" "}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-1">Observação:</h3>
              <textarea
                {...register("description", { required: true })}
                placeholder="Trazer canetas e papéis..."
                className="border-2 border-secondary rounded-md p-2 w-full text-foreground bg-background"
              />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-1">
                Livro para discussão:
              </h3>
              <Controller
                name="bookId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full border-2 border-secondary text-md py-5 cursor-pointer">
                      <SelectValue placeholder="Selecione um livro" />
                    </SelectTrigger>
                    <SelectContent className="border-secondary bg-background rounded-lg">
                      {booksFromSelectedClub.map((book) => (
                        <SelectItem
                          key={book.id}
                          value={book.id}
                          className="cursor-pointer text-md p-3"
                        >
                          {book.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <DialogFooter className=" mt-5 ">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Marcar encontro</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMeetingDialog;
