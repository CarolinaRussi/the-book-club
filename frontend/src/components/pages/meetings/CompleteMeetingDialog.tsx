import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { toast } from "react-toastify";
import { useClub } from "@//contexts/ClubContext";
import type { IMeeting, IMeetingUpdatePayload } from "@//types/IMeetings";
import { formatDayMonthYear, formatMeetingTimeForApi } from "@//utils/formatters";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { IApiError } from "@//types/IApi";
import { updateMeeting } from "@//api/mutations/meetingMutate";
import { MEETING_STATUS_COMPLETED } from "@//utils/constants/meeting";

interface CompleteMeetingDialogProps {
  openDialog: boolean;
  onOpenChange: (open: boolean) => void;
  meeting: IMeeting | undefined;
}

const CompleteMeetingDialog = ({
  openDialog,
  onOpenChange,
  meeting,
}: CompleteMeetingDialogProps) => {
  const { selectedClubId } = useClub();
  const queryClient = useQueryClient();

  const { mutate: completeMeetingMutate, isPending } = useMutation<
    any,
    IApiError,
    IMeetingUpdatePayload
  >({
    mutationFn: updateMeeting,
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["meetings", selectedClubId],
      });
      queryClient.invalidateQueries({
        queryKey: ["pastMeetings", selectedClubId],
      });
      queryClient.invalidateQueries({
        queryKey: ["booksFromSelectedClub", selectedClubId],
      });
      queryClient.invalidateQueries({
        queryKey: ["myUpcomingMeetings"],
        refetchType: "all",
      });
      onOpenChange(false);
      toast.success("Encontro concluído.");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao concluir o encontro.");
    },
  });

  const handleCompleteMeeting = () => {
    if (!meeting || !selectedClubId) {
      toast.error("Clube ou encontro não encontrado.");
      return;
    }

    completeMeetingMutate({
      id: meeting.id,
      bookId: meeting.book?.id ?? null,
      chapterStart: meeting.chapterStart ?? null,
      chapterEnd: meeting.chapterEnd ?? null,
      description: meeting.description,
      location: meeting.location,
      meetingDate: meeting.meetingDate,
      meetingTime: formatMeetingTimeForApi(meeting.meetingTime),
      status: MEETING_STATUS_COMPLETED,
      clubId: selectedClubId,
    });
  };

  return (
    <Dialog open={openDialog} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] lg:max-w-2xl">
        <DialogHeader className="gap-0">
          <DialogTitle className="text-3xl text-primary">
            Concluir encontro
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <div className="flex flex-col m-6 md:m-10 text-center">
          <h2 className="text-2xl font-medium mb-2">
            Tem certeza que deseja concluir o encontro do dia{" "}
            {formatDayMonthYear(meeting?.meetingDate)}?
          </h2>
          <p className="text-sm text-muted-foreground">
            Ele será movido para o histórico. Se esta leitura chegou ao fim, o
            livro também será marcado como finalizado.
          </p>
        </div>

        <DialogFooter className="">
          <Button onClick={handleCompleteMeeting} disabled={isPending}>
            {isPending ? "Concluindo..." : "Sim, concluir"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Voltar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompleteMeetingDialog;
