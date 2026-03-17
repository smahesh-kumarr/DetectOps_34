import api from './axios';

export const getMapReports = async () => {
  const response = await api.get('/reports/map');
  return response.data;
};

export const getReports = async () => {
    const response = await api.get('/reports');
    return response.data.data || [];
};

export const getViolations = async () => {
    const response = await api.get('/reports/violations');
    return response.data.data || [];
};

export const updateReportStatus = async (reportId, status) => {
    const response = await api.patch(`/reports/${reportId}/status`, { violationStatus: status });
    return response.data.data;
};

// Permanently deletes a resolved violation from DynamoDB (Officer action)
export const deleteViolation = async (reportId) => {
    const response = await api.delete(`/reports/${reportId}`);
    return response.data;
};

