import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  deleteGoogleOAuthDisconnect,
  fetchGoogleOAuthStatus,
  postGoogleOAuthStart,
} from "../../../../api/googleAuthApi";
import type { IApiError } from "../../../../types/IApi";
import { Button } from "../../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";

export default function GoogleCalendarProfileSection() {
  const queryClient = useQueryClient();

  const { data: status, isLoading } = useQuery({
    queryKey: ["googleOAuthStatus"],
    queryFn: fetchGoogleOAuthStatus,
    staleTime: 1000 * 60,
  });

  const { mutate: connect, isPending: isConnecting } = useMutation<
    void,
    IApiError,
    void
  >({
    mutationFn: async () => {
      const { redirectUrl } = await postGoogleOAuthStart();
      window.location.assign(redirectUrl);
    },
    onError: (error) => {
      toast.error(error.message || "Não foi possível iniciar a conexão com o Google.");
    },
  });

  const { mutate: disconnect, isPending: isDisconnecting } = useMutation<
    void,
    IApiError,
    void
  >({
    mutationFn: deleteGoogleOAuthDisconnect,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["authenticatedUser"] });
      await queryClient.invalidateQueries({ queryKey: ["googleOAuthStatus"] });
      toast.success("Google Calendar desconectado da sua conta.");
    },
    onError: (error) => {
      toast.error(error.message || "Não foi possível desconectar o Google Calendar.");
    },
  });

  const connected = status?.googleConnected ?? false;
  const email = status?.googleAccountEmail ?? null;

  return (
    <Card id="google-calendar-perfil" className="w-full md:col-span-3">
      <CardHeader>
        <CardTitle className="text-xl text-primary">Google Calendar</CardTitle>
        <CardDescription>
          Conecte sua conta Google para criar convites de encontro no calendário e
          notificar os membros do clube por e-mail.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          {isLoading ? (
            <span>Carregando estado…</span>
          ) : connected ? (
            <span>
              Estado:{" "}
              <span className="font-medium text-foreground">conectado</span>
              {email ? (
                <>
                  {" "}
                  ({email})
                </>
              ) : null}
            </span>
          ) : (
            <span>
              Estado:{" "}
              <span className="font-medium text-foreground">desconectado</span>
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {connected ? (
            <Button
              type="button"
              variant="outline"
              disabled={isDisconnecting || isLoading}
              onClick={() => disconnect()}
            >
              {isDisconnecting ? "Desconectando…" : "Desconectar Google"}
            </Button>
          ) : (
            <Button
              type="button"
              disabled={isConnecting || isLoading}
              onClick={() => connect()}
            >
              {isConnecting ? "Redirecionando…" : "Conectar Google Calendar"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
