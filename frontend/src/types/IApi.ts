import type { IUser } from "./IUser";

export interface IApiError {
  message: string;
}

export interface IApiReturnData {
  token: string;
  user: IUser;
}

export interface IPaginatedResponse<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}
