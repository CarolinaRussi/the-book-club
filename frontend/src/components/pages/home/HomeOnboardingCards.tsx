import { FaPlus } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { type ChangeEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import CreateClubDialog from "./CreateClubDialog";
import ConfirmClubDialog from "./ConfirmClubDialog";

type HomeOnboardingCardsProps = {
  variant?: "onboarding" | "sidebar" | "compact";
  className?: string;
};

export default function HomeOnboardingCards({
  variant = "sidebar",
  className,
}: HomeOnboardingCardsProps) {
  const [createClubOpen, setCreateClubOpen] = useState(false);
  const [clubCode, setClubCode] = useState("");
  const [isConfirmingClub, setConfirmingClub] = useState(false);

  const handleCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setClubCode(e.target.value.toUpperCase());
  };

  const isOnboarding = variant === "onboarding";
  const isCompact = variant === "compact";

  return (
    <>
      <div
        className={cn(
          isOnboarding
            ? "grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-10 mt-5"
            : "flex flex-col gap-4",
          className,
        )}
      >
        {isCompact && (
          <h2 className="text-lg font-semibold text-foreground">Ações rápidas</h2>
        )}
        <Card className="w-full gap-1">
          <CardHeader className={isCompact ? "pb-2" : undefined}>
            <CardTitle
              className={cn(
                "flex items-center gap-2",
                isCompact && "text-base",
              )}
            >
              <FaPlus size={isCompact ? 20 : 24} className="text-primary" />
              Criar novo clube
            </CardTitle>
          </CardHeader>
          {!isCompact && (
            <CardContent>
              <p className="text-muted-foreground">
                Crie seu próprio clube do livro e convide amigos para participar
              </p>
            </CardContent>
          )}
          <CardFooter className={isCompact ? "pt-0" : undefined}>
            <Button
              className={cn(
                "font-semibold w-full rounded-xl bg-primary text-primary-foreground cursor-pointer hover:bg-primary/80",
                isCompact ? "py-5" : "mt-6 text-1xl py-6",
              )}
              onClick={() => setCreateClubOpen(true)}
            >
              Criar Clube
            </Button>
          </CardFooter>
        </Card>
        <Card className="w-full gap-1">
          <CardHeader className={isCompact ? "pb-2" : undefined}>
            <CardTitle
              className={cn(
                "flex items-center gap-2",
                isCompact && "text-base",
              )}
            >
              <MdOutlineEmail
                size={isCompact ? 20 : 24}
                className="text-primary"
              />
              Entrar em um clube
            </CardTitle>
          </CardHeader>
          {!isCompact && (
            <CardContent>
              <p className="text-muted-foreground">
                Recebeu um convite? Digite o código para entrar em um clube
              </p>
            </CardContent>
          )}
          <CardFooter
            className={cn(
              "flex flex-col gap-3",
              isCompact ? "pt-0" : "mt-6",
            )}
          >
            <input
              className="w-full border border-secondary p-3 shadow-md rounded-xl"
              placeholder="Ex.: ENTREASPAS"
              value={clubCode}
              onChange={handleCodeChange}
            />
            <Button
              className="w-full font-semibold rounded-xl bg-background border border-secondary shadow-md text-foreground hover:bg-cream hover:text-foreground cursor-pointer py-5"
              onClick={() => setConfirmingClub(true)}
              disabled={clubCode.length === 0}
            >
              Inserir código
            </Button>
          </CardFooter>
        </Card>
      </div>
      <CreateClubDialog
        open={createClubOpen}
        onOpenChange={setCreateClubOpen}
      />
      <ConfirmClubDialog
        invitationCode={clubCode}
        open={isConfirmingClub}
        onOpenChange={(isOpen) => {
          setConfirmingClub(isOpen);
          if (!isOpen) {
            setClubCode("");
          }
        }}
        onSuccess={() => setClubCode("")}
      />
    </>
  );
}
