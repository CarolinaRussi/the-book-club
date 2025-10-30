import { api } from "../index";

interface Readers {
  id: string;
  bio: string;
  email: string;
  favorites_genres: string;
  joined_at: string;
  name: string;
  nickname: string;
  profile_picture: string;
}

export const fetchReadersByClubId = async (
  clubId: string | null
): Promise<Readers[]> => {
  const { data } = await api.get(`/club/${clubId}/readers`);
  console.log(data);
  return data;
};
