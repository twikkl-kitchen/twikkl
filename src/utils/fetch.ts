import axios from "axios";
import { toastError } from "./common";
import { clearAuth, getToken } from "../entities/auth.entity";
import { API_BASE_URL } from "@twikkl/config/api";

type MethodTypes = "get" | "post" | "put" | "patch" | "delete";

interface IRequestApiData {
  method?: MethodTypes;
  path: string;
  body?: any;
  headers?: any;
  params?: any;
}

export const fetchFromApi = async ({ method = "get", path, body, headers = {}, params }: IRequestApiData) => {
  let token = getToken();
  console.log("token", token);

  const url = `${API_BASE_URL}/api/${path}`;

  console.log({ API_BASE_URL, url });

  const requestConfig: {
    url: string;

    method: MethodTypes;

    data?: any;

    headers?: {
      Authorization?: string;
      Accept?: string;
      "Content-Type"?: string;
    };
    params?: any;
    withCredentials?: boolean;
    timeout?: number;
  } = {
    url,

    method,
    withCredentials: true,
    timeout: 30000, // 30 second timeout
  };

  if (method !== "get" && body) requestConfig.data = body;
  requestConfig.headers = {};
  
  // Only set Authorization header if token is not "session"
  // Session auth uses cookies via withCredentials
  if (token && token !== "session") {
    requestConfig.headers = { Authorization: token };
  }

  if (params) requestConfig.params = params;

  if (headers)
    requestConfig.headers = {
      ...requestConfig.headers,
      ...headers,
    };

  console.log("requestConfig", requestConfig);
  return axios(requestConfig);
};

export const handleFetchError = (err: any, key?: any) => {
  console.log({ error: err.response });
  if (err.response?.data) {
    console.log(err.response.data);
    // if (typeof err.response.data.message === "string")
    //   toastError(err.response.data.message);
    // else {
    toastError(err.response.data.message ?? "Error making Request");
    // }
    if (
      err.response.data.message === "Session expired, please login again" ||
      err.response.data.message === "Authentication expired, login again please"
    ) {
      clearAuth();
    }
  }
};
