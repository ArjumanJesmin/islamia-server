import { Response } from 'express';

interface IApiResponse<T> {
  statusCode: number;
  success: boolean;
  message?: string | null;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
  data?: T | null;
}

interface IApiResponseInput<T> {
  statusCode: number;
  success: boolean;
  message?: string | null;
  meta?: {
    page: number;
    limit: number;
    total: number;
  } | null;
  data?: T | null;
}

const sendResponse = <T>(res: Response, data: IApiResponseInput<T>): void => {
  const responseData: IApiResponse<T> = {
    statusCode: data.statusCode,
    success: data.success,
    message: data.message ?? null,
    ...(data.meta && { meta: data.meta }),
    data: data.data ?? null,
  };
  
  res.status(data.statusCode).json(responseData);
};

export default sendResponse;