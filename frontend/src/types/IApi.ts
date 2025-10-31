import { IUser } from "./IUser";

export interface IApiError {
  message: string;
}

export interface IApiReturnData {
  token: string;
  user: IUser;
}
