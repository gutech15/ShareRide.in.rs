import { create } from "zustand";

export const useRideStore = create((set) => ({
  searchParams: {
    startCity: "",
    endCity: "",
    date: "",
    seats: 1,
  },
  searchResults: [],
  hasSearched: false,

  filters: {
    sortBy: "earliest",
    timeRange: [],
    amenities: {
      maxTwoBack: false,
      autoConfirm: false,
      smoking: false,
      pets: false,
    },
  },

  setSearchParams: (params) =>
    set((state) => ({
      searchParams: { ...state.searchParams, ...params },
    })),

  setSearchResults: (results) =>
    set({ searchResults: results, hasSearched: true }),

  updateDriverInResults: (driverId, updatedData) =>
    set((state) => ({
      searchResults: state.searchResults.map((ride) => {
        const isDriver =
          ride.driverId === driverId ||
          (ride.driver && ride.driver.id === driverId);

        if (isDriver) {
          return {
            ...ride,
            driverFirstName: updatedData.firstName,
            driverLastName: updatedData.lastName,
            driverProfilePictureUrl: updatedData.profilePictureUrl,
            driver: ride.driver
              ? {
                  ...ride.driver,
                  firstName: updatedData.firstName,
                  lastName: updatedData.lastName,
                  profilePictureUrl: updatedData.profilePictureUrl,
                }
              : null,
          };
        }
        return ride;
      }),
    })),

  setFilters: (updater) =>
    set((state) => ({
      filters: typeof updater === "function" ? updater(state.filters) : updater,
    })),

  clearSearch: () =>
    set({
      searchParams: { startCity: "", endCity: "", date: "", seats: 1 },
      searchResults: [],
      hasSearched: false,
      filters: {
        sortBy: "earliest",
        timeRange: [],
        amenities: {
          maxTwoBack: false,
          autoConfirm: false,
          smoking: false,
          pets: false,
        },
      },
    }),

  clearAllRides: () => {
    set({
      searchParams: { startCity: "", endCity: "", date: "", seats: 1 },
      searchResults: [],
      hasSearched: false,
      filters: {
        sortBy: "earliest",
        timeRange: [],
        amenities: {
          maxTwoBack: false,
          autoConfirm: false,
          smoking: false,
          pets: false,
        },
      },
    });
  },
}));
