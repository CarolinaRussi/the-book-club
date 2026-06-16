export interface IUpcomingMeetingClub {
  id: string;
  name: string;
}

export interface IUpcomingMeetingBook {
  id: string;
  title: string;
  author: string | null;
  coverUrl: string | null;
}

export interface IUpcomingMeeting {
  id: string;
  meetingDate: string;
  meetingTime: string;
  location: string;
  description: string | null;
  chapterStart: number | null;
  chapterEnd: number | null;
  club: IUpcomingMeetingClub;
  book: IUpcomingMeetingBook | null;
}

export interface IUpcomingMeetingsResponse {
  data: IUpcomingMeeting[];
}
