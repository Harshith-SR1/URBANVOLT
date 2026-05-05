import { create } from 'zustand';
import { apiService } from '../services/api';

const useStationStore = create((set) => ({
  stations: [],
  recommendations: [],
  selectedStation: null,
  loading: false,
  error: null,

  fetchStations: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiService.getAllStations();
      set({ stations: response.data, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch stations', loading: false });
    }
  },

  fetchStationById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await apiService.getStation(id);
      set({ selectedStation: response.data, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch station details', loading: false });
    }
  },

  getRecommendations: async (vehicleData) => {
    set({ loading: true, error: null });
    try {
      const response = await apiService.getRecommendations(vehicleData);
      set({ recommendations: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: 'Failed to get recommendations', loading: false });
      throw error;
    }
  },
  
  clearRecommendations: () => set({ recommendations: [] }),
}));

export default useStationStore;
