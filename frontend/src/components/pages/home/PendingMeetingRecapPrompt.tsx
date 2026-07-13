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

  const { data } = useQuery({
    queryKey: ["pendingMeetingRecap", user?.id],
    queryFn: fetchPendingMeetingRecap,
    staleTime: 1000 * 60,
    enabled: !!user,
  });

  const pendingMeeting = data?.meeting ?? null;

  useEffect(() => {
    if (!pendingMeeting) {
      setOpen(false);
      return;
    }
    if (closedForMeetingId === pendingMeeting.id) {
      setOpen(false);
      return;
    }
    setOpen(true);
  }, [pendingMeeting, closedForMeetingId]);

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
              book: pendingMeeting.book,
              recap: null,
            }
          : null
      }
      showDismissButton
    />
  );
}
