import apiClient from "@/lib/axios";
import { Address, AddressPayload } from "@/types";

export const addressService = {
  async getMyAddresses(): Promise<Address[]> {
    const { data } = await apiClient.get<{ success: boolean; items: Address[] }>("/users/addresses");
    return data.items;
  },

  async createAddress(payload: AddressPayload): Promise<Address> {
    const { data } = await apiClient.post<{ success: boolean; address: Address }>(
      "/users/addresses",
      payload,
    );
    return data.address;
  },

  async updateAddress(id: string, payload: Partial<AddressPayload>): Promise<Address> {
    const { data } = await apiClient.patch<{ success: boolean; address: Address }>(
      `/users/addresses/${id}`,
      payload,
    );
    return data.address;
  },

  async setDefault(id: string): Promise<Address> {
    const { data } = await apiClient.patch<{ success: boolean; address: Address }>(
      `/users/addresses/${id}/default`,
    );
    return data.address;
  },

  async deleteAddress(id: string): Promise<void> {
    await apiClient.delete(`/users/addresses/${id}`);
  },
};
