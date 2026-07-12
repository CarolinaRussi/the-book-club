import { UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RemoveMemberButtonProps {
  memberName: string;
  disabled?: boolean;
  onConfirm: () => void;
}

export default function RemoveMemberButton({
  memberName,
  disabled,
  onConfirm,
}: RemoveMemberButtonProps) {
  return (
    <AlertDialog>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled}
                aria-label={`Remover ${memberName} do clube`}
                className="absolute top-2 right-2 z-10 size-10 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={(event) => event.stopPropagation()}
                onPointerDown={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              >
                <UserX className="size-5" />
              </Button>
            </AlertDialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Remover do clube</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AlertDialogContent
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Remover do clube</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja remover{" "}
            <span className="font-bold">{memberName}</span> do clube? A pessoa
            perderá o acesso imediatamente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.stopPropagation();
              onConfirm();
            }}
            className="bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive"
          >
            Sim, remover
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
