import { Link } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  approveJoinRequest,
  rejectJoinRequest,
} from "@/api/mutations/clubMutate";
import { fetchJoinRequests } from "@/api/queries/fetchJoinRequests";
import { Button } from "@/components/ui/button";
import type { IApiError } from "@/types/IApi";

type JoinRequestsPanelProps = {
  clubId: string;
};

export function JoinRequestsPanel({ clubId }: JoinRequestsPanelProps) {
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["joinRequests", clubId],
    queryFn: () => fetchJoinRequests(clubId),
    enabled: !!clubId,
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["joinRequests", clubId] });
    await queryClient.invalidateQueries({ queryKey: ["userClubs"] });
    await queryClient.invalidateQueries({ queryKey: ["discoverClubs"] });
  };

  const { mutate: approveMutate, isPending: isApproving } = useMutation<
    unknown,
    IApiError,
    string
  >({
    mutationFn: approveJoinRequest,
    onSuccess: async () => {
      toast.success("Pedido aprovado");
      await invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao aprovar");
    },
  });

  const { mutate: rejectMutate, isPending: isRejecting } = useMutation<
    unknown,
    IApiError,
    string
  >({
    mutationFn: rejectJoinRequest,
    onSuccess: async () => {
      toast.info("Pedido recusado");
      await invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao recusar");
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Pedidos de entrada
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pessoas que pediram para entrar neste clube.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando pedidos…</p>
      ) : requests.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum pedido pendente no momento.
        </p>
      ) : (
        <ul className="space-y-3">
          {requests.map((request) => (
            <li
              key={request.id}
              className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <Link
                to={`/users/${request.user.id}`}
                className="min-w-0 rounded-md transition-opacity hover:opacity-80"
              >
                <p className="font-medium text-foreground">
                  {request.user.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  @{request.user.nickname}
                </p>
              </Link>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={isApproving || isRejecting}
                  onClick={() => approveMutate(request.id)}
                >
                  Aprovar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isApproving || isRejecting}
                  onClick={() => rejectMutate(request.id)}
                >
                  Recusar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
