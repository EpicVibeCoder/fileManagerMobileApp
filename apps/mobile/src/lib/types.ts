export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data?: T;
  error?: unknown;
};

export type User = {
  _id: string;
  email: string;
  username?: string;
  storageUsed?: number;
  storageLimit?: number;
  agreementAccepted?: boolean;
  createdAt?: string;
};

export type AuthPayload = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type FileItem = {
  _id: string;
  name: string;
  originalName?: string;
  type?: string;
  mimeType?: string;
  size?: number;
  path?: string;
  folderId?: string | null;
  isFavorite?: boolean;
  isVault?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type FolderItem = {
  _id: string;
  name: string;
  parentId?: string | null;
  isFavorite?: boolean;
  isVault?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type FolderContents = {
  folder: FolderItem;
  subfolders: FolderItem[];
  files: FileItem[];
};

export type FavoritesPayload = {
  files: FileItem[];
  folders: FolderItem[];
};

export type DashboardPayload = {
  storage: {
    used: number;
    limit: number;
    usedPercentage?: number;
  };
  fileStats: Array<{ _id?: string; type?: string; count: number; totalSize?: number }>;
  recentItems: Array<(FileItem | FolderItem) & { category?: 'file' | 'folder' }>;
};

export type CalendarPayload = {
  files: FileItem[];
  folders: FolderItem[];
};

export type VaultPayload = {
  files: FileItem[];
  folders: FolderItem[];
};

export type HealthPayload = {
  status: string;
  database: string;
  timestamp: string;
};
