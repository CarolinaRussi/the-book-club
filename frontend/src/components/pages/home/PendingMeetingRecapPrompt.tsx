import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { fetchPendingMeetingRecap } from "@/api/queries/fetchPendingMeetingRecap";
import MeetingRecapDialog from "@/components/pages/meetings/MeetingRecapDialog";

export default function PendingMeetingRecapPrompt() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [closedForMeetingId, setClosedForMeetingId] = useState<string | null>(
    null,
  );

  const { data, isFetched } = useQuery({
    queryKey: ["pendingMeetingRecap", user?.id],
    queryFn: fetchPendingMeetingRecap,
    staleTime: 0,
    refetchOnMount: "always",
    enabled: !!user,
  });

  const pendingMeeting = data?.meeting ?? null;

  useEffect(() => {
    if (!isFetched) return;
    if (!pendingMeeting) {
      setOpen(false);
      return;
    }
    if (closedForMeetingId === pendingMeeting.id) {
      setOpen(false);
      return;
    }
    setOpen(true);
  }, [pendingMeeting, closedForMeetingId, isFetched]);

  return (
    <MeetingRecapDialog
      openDialog={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen && pendingMeeting) {
          setClosedForMeetingId(pendingMeeting.id);
        }
      }}
      meeting={
        pendingMeeting
          ? {
              id: pendingMeeting.id,
              meetingDate: pendingMeeting.meetingDate,
              books: pendingMeeting.books,
              recap: null,
            }
          : null
      }
      showDismissButton
    />
  );
}
