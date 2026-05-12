import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

const REASON_LABELS: Record<string, string> = {
  access_denied: "acesso negado",
  missing_code_or_state: "resposta incompleta do Google",
  invalid_state: "sessão expirada; tente conectar novamente",
  token_exchange: "falha ao trocar o código por tokens",
  missing_refresh_token:
    "o Google não devolveu permissão contínua; tente revogar o app na conta Google e conectar de novo",
  config: "configuração do servidor incompleta",
  server: "erro no servidor",
};

function formatReason(reason: string | null): string {
  if (!reason) return "motivo desconhecido";
  return REASON_LABELS[reason] ?? reason;
}

export function GoogleOAuthReturnHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const google = params.get("google");
    if (!google) {
      return;
    }

    const dedupeKey = `google-oauth-return:${location.pathname}${location.search}`;
    const already = sessionStorage.getItem(dedupeKey);
    if (already) {
      params.delete("google");
      params.delete("reason");
      const rest = params.toString();
      navigate(`${location.pathname}${rest ? `?${rest}` : ""}`, {
        replace: true,
      });
      return;
    }
    sessionStorage.setItem(dedupeKey, "1");

    if (google === "connected") {
      toast.success("Google Calendar conectado à sua conta.");
      void queryClient.invalidateQueries({ queryKey: ["authenticatedUser"] });
      void queryClient.invalidateQueries({ queryKey: ["googleOAuthStatus"] });
    } else if (google === "error") {
      const reason = formatReason(params.get("reason"));
      toast.error(`Não foi possível conectar o Google Calendar (${reason}).`);
    }

    params.delete("google");
    params.delete("reason");
    const rest = params.toString();
    const next = `${location.pathname}${rest ? `?${rest}` : ""}`;
    navigate(next, { replace: true });
  }, [location.pathname, location.search, navigate, queryClient]);

  return null;
}
