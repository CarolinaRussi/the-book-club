import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "../../ui/responsive-dialog";
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
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="gap-2 sm:max-w-[425px]">
        <div className="flex min-h-0 flex-1 flex-col">
          <ResponsiveDialogHeader className="gap-0">
            <ResponsiveDialogTitle className="text-3xl text-primary">
              Entrar em um Clube
            </ResponsiveDialogTitle>
          </ResponsiveDialogHeader>
          <ResponsiveDialogBody>
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
          </ResponsiveDialogBody>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};

export default JoinClubDialog;
