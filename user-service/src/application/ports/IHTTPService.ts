export type HTTPSuccess<T> = {
   success: true;
   data: T;
   error: null;
};

export type HTTPFailed<E> = {
   error: E;
   success: false;
   data: null;
};

export type AppHTTPResponse<T, E> = HTTPSuccess<T> | HTTPFailed<E>;

export interface IHTTPService {
   get<T, E = Error>(url: string, config?: { params: any }): Promise<AppHTTPResponse<T, E>>;
   post<T, E = Error>(url: string, data: unknown): Promise<AppHTTPResponse<T, E>>;
}
