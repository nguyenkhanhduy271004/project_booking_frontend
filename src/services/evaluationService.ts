import { apiClient } from './api';
import type { Evaluation, EvaluationCreateRequest, EvaluationUpdateRequest, ApiResponse } from '../types';
export const evaluationService = {
  createEvaluation: (evaluationData: EvaluationCreateRequest): Promise<ApiResponse<void>> =>
    apiClient.post('/api/v1/evaluates', evaluationData),
  updateEvaluation: (id: number, evaluationData: EvaluationUpdateRequest): Promise<ApiResponse<void>> =>
    apiClient.put(`/api/v1/evaluates/${id}`, evaluationData),
  deleteEvaluation: (id: number): Promise<ApiResponse<void>> =>
    apiClient.delete(`/api/v1/evaluates/${id}`),
  deleteEvaluations: (ids: number[]): Promise<ApiResponse<void>> =>
    apiClient.delete('/api/v1/evaluates/ids', { data: ids }),
  restoreEvaluation: (id: number): Promise<ApiResponse<void>> =>
    apiClient.put(`/api/v1/evaluates/${id}/restore`),
  restoreEvaluations: (ids: number[]): Promise<ApiResponse<void>> =>
    apiClient.put('/api/v1/evaluates/restore', { data: ids }),
  getEvaluationsByRoomId: (roomId: number): Promise<ApiResponse<Evaluation[]>> =>
    apiClient.get(`/api/v1/evaluates/room/${roomId}`),
};