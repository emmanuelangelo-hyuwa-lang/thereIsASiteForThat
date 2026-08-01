export type ApiSuccess<T> = {
  success: true;
  data: T;
  error: null;
};

export type ApiFailure = {
  success: false;
  data: null;
  error: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export function ok<T>(data: T): ApiSuccess<T> {
  return { success: true, data, error: null };
}

export function fail(error: string): ApiFailure {
  return { success: false, data: null, error };
}
