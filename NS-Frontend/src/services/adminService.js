// services/adminAuthService.js

import api from "./api";

export const adminLogin = async (data) => {
  const response = await api.post("/auth/admin/login", data);

  return response.data;
};