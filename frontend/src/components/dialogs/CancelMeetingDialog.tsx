import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { toast } from "react-toastify";
import { useClub } from "../../contexts/ClubContext";
import type { IMeeting } from "@//types/IMeetings";

import { formatDayMonthYear } from "@//utils/formatters";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { IApiError } from "@//types/IApi";
import { cancelMeeting } from "@//api/mutations/meetingMutate";
interface EditMeetingDialogProps {
  openDialog: boolean;
  onOpenChange: (open: boolean) => void;
  meeting: IMeeting | undefined;
}

const CancelMeetingDialog = ({
  openDialog,
  onOpenChange,
  meeting,
}: EditMeetingDialogProps) => {
  const { selectedClubId } = useClub();
  const queryClient = useQueryClient();

  const { mutate: cancelMeetingMutate, isPending } = useMutation<
    any,
    IApiError,
    string | undefined
  >({
    mutationFn: cancelMeeting,
    onSuccess: async (result) => {
      console.log(result);
      queryClient.invalidateQueries({
        queryKey: ["meetings", selectedClubId],
      });
      onOpenChange(false);
      toast.success("Encontro cancelado.");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao cancelar o encontro.");
    },
  });

  return (
    <Dialog open={openDialog} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] lg:max-w-2xl">
        <DialogHeader className="gap-0">
          <DialogTitle className="text-3xl text-primary">
            Cancelar encontro
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <div className="flex flex-col m-10 text-center">
          <h2 className="text-2xl font-medium mb-1">
            Tem certeza que deseja cancelar o encontro do dia{" "}
            {formatDayMonthYear(meeting?.meeting_date)}?
          </h2>
        </div>

        <DialogFooter className="">
          <Button
            onClick={() => cancelMeetingMutate(meeting?.id)}
            disabled={isPending}
          >
            {isPending ? "Cancelando..." : "Sim, cancelar"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Ops, não quero
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelMeetingDialog;
