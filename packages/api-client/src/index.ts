export {
  request,
  type ApiClientConfig,
  type ApiError,
  type ApiResult,
  type RequestOptions,
} from './http';
export {
  createApiClient,
  type InnovaApiClient,
  type ListItemsParams,
  type ListGuidesParams,
  type ListErrorTagsParams,
} from './client';
export * from './admin';
export * from './guides';
// Re-export the full schema surface (no name collisions with ./guides — verified).
// Keeps new schemas/types — heatmap, parent, topic catalog — exported automatically.
export * from './schemas';
