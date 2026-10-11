import { apiDownload, apiRequest } from '@/lib/api/client';
import type {
  AuthPayload,
  CalendarPayload,
  DashboardPayload,
  FavoritesPayload,
  FileItem,
  FolderContents,
  FolderItem,
  HealthPayload,
  TokenPair,
  User,
  VaultPayload,
} from '@/lib/types';

export const healthApi = {
  check: () => apiRequest<HealthPayload>('/api/health', { auth: false }),
};

export const authApi = {
  signup: (body: {
    email: string;
    password: string;
    confirmPassword: string;
    agreementAccepted: string;
  }) => apiRequest<AuthPayload>('/api/auth/signup', { method: 'POST', body, auth: false }),

  login: (body: { email: string; password: string }) =>
    apiRequest<AuthPayload>('/api/auth/login', { method: 'POST', body, auth: false }),

  logout: (refreshToken?: string | null) =>
    apiRequest<null>('/api/auth/logout', {
      method: 'POST',
      body: refreshToken ? { refreshToken } : {},
      skipRefresh: true,
    }),

  refresh: (refreshToken: string) =>
    apiRequest<TokenPair>('/api/auth/refresh-token', {
      method: 'POST',
      body: { refreshToken },
      auth: false,
    }),

  updateProfile: (username: string) =>
    apiRequest<{ user: User }>('/api/auth/profile', { method: 'PUT', body: { username } }),

  changePassword: (oldPassword: string, newPassword: string) =>
    apiRequest<null>('/api/auth/change-password', {
      method: 'POST',
      body: { oldPassword, newPassword },
    }),

  forgotPassword: (email: string) =>
    apiRequest<{ otp?: string; expiresIn?: string } | null>('/api/auth/forgot-password', {
      method: 'POST',
      body: { email },
      auth: false,
    }),

  verifyOtp: (email: string, otp: string) =>
    apiRequest<{ resetToken: string }>('/api/auth/verify-otp', {
      method: 'POST',
      body: { email, otp },
      auth: false,
    }),

  resetPassword: (token: string, newPassword: string) =>
    apiRequest<null>('/api/auth/reset-password', {
      method: 'POST',
      body: { token, newPassword },
      auth: false,
    }),
};

export const filesApi = {
  list: (params?: { type?: string; folderId?: string }) => {
    const q = new URLSearchParams();
    if (params?.type) q.set('type', params.type);
    if (params?.folderId) q.set('folderId', params.folderId);
    const qs = q.toString();
    return apiRequest<FileItem[]>(`/api/files${qs ? `?${qs}` : ''}`);
  },

  get: (id: string) => apiRequest<FileItem>(`/api/files/${id}`),

  upload: (formData: FormData) =>
    apiRequest<FileItem[]>('/api/files/upload', { method: 'POST', formData }),

  rename: (id: string, name: string) =>
    apiRequest<FileItem>(`/api/files/${id}/rename`, { method: 'PUT', body: { name } }),

  duplicate: (id: string) => apiRequest<FileItem>(`/api/files/${id}/duplicate`, { method: 'POST' }),

  remove: (id: string) => apiRequest<null>(`/api/files/${id}`, { method: 'DELETE' }),

  download: (id: string, vaultPin?: string | null) =>
    apiDownload(`/api/files/${id}/download`, { vaultPin }),
};

export const foldersApi = {
  list: (parentId?: string | null) => {
    // Omit parentId for root — API treats missing query as parentId=null
    const q = parentId ? `?parentId=${encodeURIComponent(parentId)}` : '';
    return apiRequest<FolderItem[]>(`/api/folders${q}`);
  },

  create: (name: string, parentId?: string | null) =>
    apiRequest<FolderItem>('/api/folders', {
      method: 'POST',
      body: parentId ? { name, parentId } : { name },
    }),

  contents: (id: string) => apiRequest<FolderContents>(`/api/folders/${id}/files`),

  rename: (id: string, name: string) =>
    apiRequest<FolderItem>(`/api/folders/${id}/rename`, { method: 'PUT', body: { name } }),

  remove: (id: string) => apiRequest<null>(`/api/folders/${id}`, { method: 'DELETE' }),
};

export const favoritesApi = {
  list: () => apiRequest<FavoritesPayload>('/api/favorites'),
  addFile: (id: string) => apiRequest<FileItem>(`/api/favorites/files/${id}`, { method: 'POST' }),
  removeFile: (id: string) =>
    apiRequest<FileItem>(`/api/favorites/files/${id}`, { method: 'DELETE' }),
  addFolder: (id: string) =>
    apiRequest<FolderItem>(`/api/favorites/folders/${id}`, { method: 'POST' }),
  removeFolder: (id: string) =>
    apiRequest<FolderItem>(`/api/favorites/folders/${id}`, { method: 'DELETE' }),
};

export const dashboardApi = {
  get: () => apiRequest<DashboardPayload>('/api/dashboard'),
};

export const vaultApi = {
  setPin: (pin: string) => apiRequest<null>('/api/vault/pin', { method: 'POST', body: { pin } }),
  verifyPin: (pin: string) =>
    apiRequest<null>('/api/vault/verify', { method: 'POST', body: { pin } }),
  list: (pin: string) => apiRequest<VaultPayload>('/api/vault', { vaultPin: pin }),
  moveFile: (id: string) =>
    apiRequest<FileItem>(`/api/vault/files/${id}/move`, { method: 'POST' }),
  restoreFile: (id: string, pin: string) =>
    apiRequest<FileItem>(`/api/vault/files/${id}/restore`, {
      method: 'POST',
      vaultPin: pin,
    }),
  moveFolder: (id: string) =>
    apiRequest<FolderItem>(`/api/vault/folders/${id}/move`, { method: 'POST' }),
  restoreFolder: (id: string, pin: string) =>
    apiRequest<FolderItem>(`/api/vault/folders/${id}/restore`, {
      method: 'POST',
      vaultPin: pin,
    }),
};

export const calendarApi = {
  byDate: (date: string) =>
    apiRequest<CalendarPayload>(`/api/calendar?date=${encodeURIComponent(date)}`),
};
