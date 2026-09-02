import { useState } from "react";
import { Link2 } from "lucide-react";
import { toast } from "react-toastify";
import { FaCheck, FaRegCopy } from "react-icons/fa6";
import { useAuth } from "@/contexts/AuthContext";
import { useClub } from "@/contexts/ClubContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { buildInviteUrl } from "@/utils/inviteUrl";

type HomeInviteCardProps = {
  className?: string;
};

export default function HomeInviteCard({ className }: HomeInviteCardProps) {
  const { user } = useAuth();
  const { clubs, selectedClubId } = useClub();
  const [copiedLink, setCopiedLink] = useState(false);

  const selectedClub = clubs.find((club) => club.id === selectedClubId);
  const isAdmin =
    !!user && !!selectedClub && selectedClub.ownerId === user.id;

  if (!isAdmin || !selectedClub) {
    return null;
  }

  const invitationCode = selectedClub.invitationCode?.trim() ?? "";
  const copyLabel = copiedLink ? "Link copiado" : "Copiar link";

  const handleCopyInviteLink = () => {
    if (!invitationCode) {
      toast.error("Este clube ainda não tem código de convite.");
      return;
    }
    void navigator.clipboard.writeText(buildInviteUrl(invitationCode));
    setCopiedLink(true);
    window.setTimeout(() => setCopiedLink(false), 2000);
    toast.info("Link de convite copiado!");
  };

  return (
    <Card className={cn("w-full gap-2 py-4", className)}>
      <CardHeader className="px-4 pb-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Link2 className="h-4 w-4 text-primary" />
          Código de Convite · {selectedClub.name}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Use o código para convidar outros membros pro clube.
        </p>
      </CardHeader>
      <CardContent className="px-4 pt-2">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1 truncate rounded-md border border-border bg-background px-3 py-2 font-mono text-sm tracking-wide text-foreground">
            {invitationCode || "—"}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={handleCopyInviteLink}
                disabled={!invitationCode}
                aria-label={copyLabel}
              >
                {copiedLink ? (
                  <FaCheck className="text-green-600" />
                ) : (
                  <FaRegCopy />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{copyLabel}</TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  );
}
