import { useNavigate, useParams } from "react-router";
import { GiBookCover } from "react-icons/gi";
import JoinClubPanel from "@/components/pages/home/JoinClubPanel";
import { useAuth } from "@/contexts/AuthContext";
import SkeletonHome from "@/components/private/SkeletonHome";

export default function InviteJoin() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { isLoggedIn, isLoadingUser } = useAuth();

  if (isLoadingUser) {
    return <SkeletonHome />;
  }

  if (!code) {
    return (
      <div className="mx-auto mt-16 max-w-md text-center">
        <p className="text-lg font-semibold text-primary">
          Código de convite inválido.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-12 flex w-full max-w-md flex-col items-center gap-6 px-4 pb-16">
      <GiBookCover size={72} className="text-primary" />
      <div className="w-full rounded-lg border-2 border-secondary bg-background p-6 shadow-md">
        <h1 className="mb-4 text-center text-3xl font-bold text-primary">
          Convite para o clube
        </h1>
        <JoinClubPanel
          invitationCode={code}
          variant="page"
          onCancel={() => navigate(isLoggedIn ? "/home" : "/")}
          onJoined={() => navigate("/home")}
        />
      </div>
    </div>
  );
}
