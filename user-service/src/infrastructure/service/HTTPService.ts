import { AppHTTPResponse, IHTTPService } from '@ports/IHTTPService';
import axios, { AxiosInstance } from 'axios';

export class AxiosHTTPService implements IHTTPService {
   private readonly _client: AxiosInstance;
   constructor() {
      this._client = axios.create();
   }
   get = async <T, E>(url: string, config?: { params: any }): Promise<AppHTTPResponse<T, E>> => {
      try {
         const res = await this._client.get<T>(url, { params: config?.params });
         return { data: res.data, success: true, error: null };
      } catch (err) {
         return { error: err as E, success: false, data: null };
      }
   };

   post = async <T, E>(url: string, data: unknown): Promise<AppHTTPResponse<T, E>> => {
      try {
         const res = await this._client.post<T>(url, data);
         return { data: res.data, success: true, error: null };
      } catch (err) {
         return { error: err as E, success: false, data: null };
      }
   };
}
