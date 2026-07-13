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

  if (isCompact) {
    return (
      <>
        <div className={cn("flex flex-col gap-2", className)}>
          <Button
            className="h-10 w-full rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-primary/80"
            onClick={() => setCreateClubOpen(true)}
          >
            <FaPlus className="mr-2 size-4" />
            Criar clube
          </Button>
          <div className="flex flex-col gap-1.5">
            <p className="text-sm text-muted-foreground">
              Tem um código de convite? Entre em um clube
            </p>
            <div className="flex gap-2">
              <input
                className="min-w-0 flex-1 rounded-xl border border-secondary px-3 py-2 text-sm shadow-sm"
                placeholder="Ex.: ENTRELIVROS"
                value={clubCode}
                onChange={handleCodeChange}
                aria-label="Código de convite"
              />
              <Button
                variant="outline"
                className="h-10 shrink-0 rounded-xl border-secondary px-3 font-semibold"
                onClick={() => setConfirmingClub(true)}
                disabled={clubCode.length === 0}
              >
                Entrar
              </Button>
            </div>
          </div>
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
        <Card className="w-full gap-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaPlus size={24} className="text-primary" />
              Criar novo clube
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Crie seu próprio clube do livro e convide amigos para participar
            </p>
          </CardContent>
          <CardFooter>
            <Button
              className="mt-6 w-full cursor-pointer rounded-xl bg-primary py-6 font-semibold text-1xl text-primary-foreground hover:bg-primary/80"
              onClick={() => setCreateClubOpen(true)}
            >
              Criar Clube
            </Button>
          </CardFooter>
        </Card>
        <Card className="w-full gap-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdOutlineEmail size={24} className="text-primary" />
              Entrar em um clube
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Recebeu um convite? Digite o código para entrar em um clube
            </p>
          </CardContent>
          <CardFooter className="mt-6 flex flex-col gap-3">
            <input
              className="w-full rounded-xl border border-secondary p-3 shadow-md"
              placeholder="Ex.: ENTRELIVROS"
              value={clubCode}
              onChange={handleCodeChange}
            />
            <Button
              className="w-full cursor-pointer rounded-xl border border-secondary bg-background py-5 font-semibold text-foreground shadow-md hover:bg-cream hover:text-foreground"
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
