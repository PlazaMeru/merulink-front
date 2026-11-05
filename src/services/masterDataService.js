import axios from 'axios';
import { ENV } from '../config/env';

export const getDepartments = async () => {
  const response = await axios.get(`${ENV.API_BACK_URL}departments`);
  return await response.data.data;
};

export const getEventCategories = async () => {
  const response = await axios.get(`${ENV.API_BACK_URL}eventCategories`);
  return await response.data.data;
};

export const getEventLocations = async () => {
  const response = await axios.get(`${ENV.API_BACK_URL}locations`);
  return await response.data.data;
};

export const getLocationById = async (id) => {
  const response = await axios.get(`${ENV.API_BACK_URL}locations/${id}`);
  return response.data.data;
};

export const getEmployeesByDept = async (departmentId, start, end) => {
  const response = await axios.get(`${ENV.API_BACK_URL}schedule-plannings/filter-schedule/?departmentId=${departmentId}&start=${start}&end=${end}`);
  return await response.data;
};

const rolesCache = { data: null };

export const getRoles = async () => {
  // if (rolesCache.data) return rolesCache.data;
  const response = await axios.get(`${ENV.API_BACK_URL}roles`);
  rolesCache.data = response.data;
  return response.data;
};

export const getEmployeesByPermission = async (permission) => {
  const response = await axios.get(`${ENV.API_BACK_URL}employees/by-permission`, {
    params: { permission },
  });
  return response.data.data;
};