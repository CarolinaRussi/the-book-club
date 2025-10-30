interface IApiError {
  message: string;
}

interface IUser {
  id: string;
  email: string;
  name: string;
  nickname: string;
}

interface IApiReturnData {
  token: string;
  user: IUser;
}

export type { IApiError, IUser, IApiReturnData };
