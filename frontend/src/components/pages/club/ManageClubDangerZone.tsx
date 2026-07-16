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
import { Button } from "@/components/ui/button";

type ManageClubDangerZoneProps = {
  clubName: string;
  isDeleting: boolean;
  onDelete: () => void;
};

export function ManageClubDangerZone({
  clubName,
  isDeleting,
  onDelete,
}: ManageClubDangerZoneProps) {
  return (
    <div className="space-y-3 border-t pt-8">
      <h2 className="text-sm font-bold uppercase tracking-wider text-primary">
        Zona de perigo
      </h2>
      <div className="flex flex-col gap-4 rounded-md border bg-secondary/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-primary">
          <p className="font-medium">Excluir este clube</p>
          <p className="text-xs text-muted-foreground">
            Esta ação não pode ser desfeita.
          </p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              {isDeleting ? "Excluindo..." : "Excluir clube"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Você tem certeza absoluta disso?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. O clube{" "}
                <span className="font-bold">{clubName}</span>, seus membros,
                encontros e a lista de livros deste clube serão removidos. Os
                livros continuam no catálogo geral do sistema quando também
                existem em outros clubes ou na sua biblioteca pessoal.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive"
              >
                Confirmar exclusão
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
