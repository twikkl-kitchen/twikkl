import { fetchFromApi, handleFetchError } from "@twikkl/utils/fetch";

export interface Server {
  id: string;
  title: string;
  description: string;
  location?: string;
  hashtags?: string[];
  isPrivate: boolean;
  coverImage?: string;
  profileImage?: string;
  memberCount: number;
  createdAt: string;
  ownerId: string;
}

export interface CreateServerData {
  title: string;
  description?: string;
  location?: string;
  hashtags?: string[];
  isPrivate: boolean;
  memberIds?: string[];
}

export interface Member {
  id: string;
  username: string;
  name: string;
  avatar?: string;
}

export const getServers = async (type: "all" | "joined" | "favorites" = "all") => {
  try {
    const { data } = await fetchFromApi({
      path: `servers`,
      method: "get",
      params: { type },
    });
    return data;
  } catch (error) {
    handleFetchError(error);
    throw error;
  }
};

export const getServerById = async (id: string) => {
  try {
    const { data } = await fetchFromApi({
      path: `servers/${id}`,
      method: "get",
    });
    return data;
  } catch (error) {
    handleFetchError(error);
    throw error;
  }
};

export const createServer = async (serverData: CreateServerData) => {
  try {
    const { data } = await fetchFromApi({
      path: "servers",
      method: "post",
      body: serverData,
    });
    return data;
  } catch (error) {
    handleFetchError(error);
    throw error;
  }
};

export const updateServer = async (id: string, serverData: Partial<CreateServerData>) => {
  try {
    const { data } = await fetchFromApi({
      path: `servers/${id}`,
      method: "put",
      body: serverData,
    });
    return data;
  } catch (error) {
    handleFetchError(error);
    throw error;
  }
};

export const deleteServer = async (id: string) => {
  try {
    const { data } = await fetchFromApi({
      path: `servers/${id}`,
      method: "delete",
    });
    return data;
  } catch (error) {
    handleFetchError(error);
    throw error;
  }
};

export const joinServer = async (id: string) => {
  try {
    const { data } = await fetchFromApi({
      path: `servers/${id}/join`,
      method: "post",
    });
    return data;
  } catch (error) {
    handleFetchError(error);
    throw error;
  }
};

export const leaveServer = async (id: string) => {
  try {
    const { data } = await fetchFromApi({
      path: `servers/${id}/leave`,
      method: "post",
    });
    return data;
  } catch (error) {
    handleFetchError(error);
    throw error;
  }
};

export const getServerMembers = async (id: string) => {
  try {
    const { data } = await fetchFromApi({
      path: `servers/${id}/members`,
      method: "get",
    });
    return data;
  } catch (error) {
    handleFetchError(error);
    throw error;
  }
};

export const inviteMembers = async (serverId: string, memberIds: string[]) => {
  try {
    const { data } = await fetchFromApi({
      path: `servers/${serverId}/invite`,
      method: "post",
      body: { memberIds },
    });
    return data;
  } catch (error) {
    handleFetchError(error);
    throw error;
  }
};

export const toggleFavorite = async (id: string) => {
  try {
    const { data } = await fetchFromApi({
      path: `servers/${id}/favorite`,
      method: "post",
    });
    return data;
  } catch (error) {
    handleFetchError(error);
    throw error;
  }
};
