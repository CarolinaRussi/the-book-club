
interface IApiError {
  message: string;
}

interface IApiReturnData {
  token: string;
  id: string;
  name: string;
}

export type { IApiError, IApiReturnData };