import apiClient from "@/lib/axios";
import { User, UserListParams, UserListResponse } from "@/types";

export const userService = {
  async getMe(): Promise<User> {
    const { data } = await apiClient.get<{ user: User }>("/users/me");
    return data.user;
  },

  async updateMe(payload: { fullName: string; avatarUrl?: string }): Promise<User> {
    const { data } = await apiClient.patch<{ user: User }>("/users/me", payload);
    return data.user;
  },

  async changeMyPassword(payload: {
    oldPassword: string;
    newPassword: string;
  }): Promise<User> {
    const { data } = await apiClient.patch<{ user: User }>(
      "/users/me/password",
      payload,
    );
    return data.user;
  },

  async listUsers(params: UserListParams = {}): Promise<UserListResponse> {
    const { data } = await apiClient.get<UserListResponse>("/users", {
      params,
    });
    return data;
  },

  async updateUserStatus(id: string, isActive: boolean): Promise<User> {
    const { data } = await apiClient.patch<{ user: User }>(
      `/users/${id}/status`,
      {
        isActive,
      },
    );
    return data.user;
  },

  async deactivateUser(id: string, reason: string): Promise<User> {
    const { data } = await apiClient.patch<{ user: User }>(
      `/users/${id}/deactivate`,
      { reason },
    );
    return data.user;
  },

  async activateUser(id: string): Promise<User> {
    const { data } = await apiClient.patch<{ user: User }>(
      `/users/${id}/activate`,
    );
    return data.user;
  },
};
