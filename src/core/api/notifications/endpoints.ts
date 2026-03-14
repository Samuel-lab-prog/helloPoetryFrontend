import { createHTTPRequest } from "@root/features/base";
import {
  createMutationEndpoint,
  createQueryEndpoint
} from "../utils";

import { notificationsKeys } from "./keys";

const API_URL = import.meta.env.VITE_API_URL;

const getNotifications = createQueryEndpoint({
  key: notificationsKeys.page,

  fn: (params: {
    onlyUnread?: boolean;
    limit?: number;
    nextCursor?: string;
  } = {}) =>
    createHTTPRequest({
      method: "GET",
      path: `${API_URL}/notifications`,
      query: params,
    }),
});

const getNotificationById = createQueryEndpoint({
  key: notificationsKeys.byId,

  fn: (id: string) =>
    createHTTPRequest({
      method: "GET",
      path: `${API_URL}/notifications/${id}`,
    }),
});

const markNotificationAsRead = createMutationEndpoint({
  fn: (id: string) =>
    createHTTPRequest({
      method: "PATCH",
      path: `${API_URL}/notifications/${id}/read`,
    }),

  invalidate: [
    notificationsKeys.all
  ],
});

const deleteNotification = createMutationEndpoint({
  fn: (id: string) =>
    createHTTPRequest({
      method: "DELETE",
      path: `${API_URL}/notifications/${id}`,
    }),

  invalidate: [
    notificationsKeys.all
  ],
});

const markAllAsRead = createMutationEndpoint({
  fn: () =>
    createHTTPRequest({
      method: "PATCH",
      path: `${API_URL}/notifications/mark-all-read`,
    }),

  invalidate: [
    notificationsKeys.all
  ],
});

export const notifications = {
  getNotifications,
  getNotificationById,
  markNotificationAsRead,
  deleteNotification,
  markAllAsRead,
};
