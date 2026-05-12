import { Link } from "react-router";
import { useAuth } from "../../../contexts/AuthContext";

export default function MeetingGoogleCalendarFormNote() {
  const { user } = useAuth();
  if (!user) {
    return null;
  }

  if (user.googleConnected) {
    return (
      <p className="mb-3 text-sm text-muted-foreground border-l-2 border-primary/50 pl-3 py-0.5">
        Com o Google conectado, convites no calendário serão enviados por e-mail aos
        membros do clube.
      </p>
    );
  }

  return (
    <p className="mb-3 text-sm text-muted-foreground border-l-2 border-amber-500/70 pl-3 py-0.5">
      Sem Google Calendar conectado na sua conta, não enviaremos convites
      automáticos por calendário.{" "}
      <Link
        to="/me?tab=profile#google-calendar-perfil"
        className="text-primary font-medium underline underline-offset-2 hover:text-primary/90"
      >
        Conectar no perfil
      </Link>
    </p>
  );
}
