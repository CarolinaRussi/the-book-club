import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import JoinClubPanel from "./JoinClubPanel";

interface JoinClubDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invitationCode: string;
  onSuccess: () => void;
}

const JoinClubDialog = ({
  open,
  onOpenChange,
  invitationCode,
  onSuccess,
}: JoinClubDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-2 sm:max-w-[425px]">
        <DialogHeader className="gap-0">
          <DialogTitle className="text-3xl text-primary">
            Entrar em um Clube
          </DialogTitle>
        </DialogHeader>
        <JoinClubPanel
          invitationCode={invitationCode}
          enabled={open && !!invitationCode}
          variant="dialog"
          onCancel={() => onOpenChange(false)}
          onJoined={() => {
            onOpenChange(false);
            onSuccess();
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default JoinClubDialog;
