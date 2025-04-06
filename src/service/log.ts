import axios from 'axios';
import { LogEntry, Logs } from '../types/log';

const BASE_URL = 'https://trip-track-backend.onrender.com/logs';

export const getLogs = async (): Promise<Logs[] | null> => {
    try {
      const response = await axios.get<Logs[]>(`${BASE_URL}/`);
      return response.data;
    }catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status !== 404) {
                console.error('Error fetching logs:', error);
            }
        } else {
            console.error('Unexpected error:', error);
        }
        return null;
    }
};

// Get logs by date (GET /logs/2025-04-04)
export const getLogsByDate = async (date: string): Promise<Logs | null> => {
  try {
    const response = await axios.get<Logs[]>(`${BASE_URL}/${date}/`);
    return response.data[0];
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
        if (error.response?.status !== 404) {
            console.error('Error fetching logs:', error);
        }
    } else {
        console.error('Unexpected error:', error);
    }
    return null;
  }
};

// Get logs by date (GET /logs/2025-04-04)
export const getLogsByDateRange = async (start: string,end: string): Promise<Logs[] | null> => {
    try {
      const response = await axios.get<Logs[]>(`${BASE_URL}/by-range?start=${start}&end=${end}`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
          if (error.response?.status !== 404) {
              console.error('Error fetching logs:', error);
          }
      } else {
          console.error('Unexpected error:', error);
      }
      return null;
    }
};

export const createLog = async (log: Logs): Promise<boolean> => {
  try {
    const response = await axios.post<Logs>(`${BASE_URL}/add/`, log);
    if(response.status==201) return true;
    else return false;
  } catch (error) {
    console.error('Error creating log:', error);
    return false;
  }
};

export const updateLog = async (log_id: string, logEntry: LogEntry[]): Promise<boolean> => {
  try {
    const response = await axios.put<Logs>(`${BASE_URL}/${log_id}/update/`, {"logEntry":logEntry});
    if(response.status==200) return true;
    else return false;
  } catch (error) {
    console.error('Error updating log:', error);
    return false;
  }
};

export const deleteLog = async (log_id: string): Promise<boolean> => {
  try {
    await axios.delete(`${BASE_URL}/${log_id}/delete/`);
    return true;
  } catch (error) {
    console.error('Error deleting log:', error);
    return false;
  }
};
