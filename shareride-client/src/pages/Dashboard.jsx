import React, { useState, useMemo } from "react";
import { useAuthStore } from "../store/useAuthStore";
import API from "../api/axiosInstance";
import RideCard from "../components/RideCard";
import "./Dashboard.css";

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);

  const [rides, setRides] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [filters, setFilters] = useState({
    sortBy: "earliest",
    timeRange: [],
    amenities: {
      maxTwoBack: false,
      autoConfirm: false,
      smoking: false,
      pets: false,
    },
  });

  const [searchParams, setSearchParams] = useState({
    startCity: "",
    endCity: "",
    date: "",
    seats: 1,
  });

  // glavna logika filtriranja
  const filteredRides = useMemo(() => {
    let result = [...rides];

    // filtriranje po vremenu
    if (filters.timeRange.length > 0) {
      result = result.filter((ride) => {
        const hour = new Date(ride.departureTime).getHours();
        const isMorning = hour >= 6 && hour <= 12;
        const isAfternoon = hour > 12 && hour <= 18;

        if (filters.timeRange.includes("morning") && isMorning) return true;
        if (filters.timeRange.includes("afternoon") && isAfternoon) return true;
        return false;
      });
    }

    // filtriranje po opcijama
    if (filters.amenities.maxTwoBack)
      result = result.filter((r) => r.maxTwoBack);
    if (filters.amenities.autoConfirm)
      result = result.filter((r) => r.isAutoConfirmation);
    if (filters.amenities.smoking)
      result = result.filter((r) => r.allowSmoking);
    if (filters.amenities.pets) result = result.filter((r) => r.allowPets);

    // sortiranje
    if (filters.sortBy === "earliest") {
      result.sort(
        (a, b) => new Date(a.departureTime) - new Date(b.departureTime),
      );
    } else if (filters.sortBy === "price") {
      result.sort((a, b) => a.pricePerSeat - b.pricePerSeat);
    }

    return result;
  }, [rides, filters]);

  const handleInputChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await API.get("/rides", { params: searchParams });
      setRides(response.data);
      console.log(response.data);
      setHasSearched(true);
    } catch (err) {
      console.error(err);
    }
  };

  const resetFilters = () => {
    setFilters({
      sortBy: "earliest",
      timeRange: [],
      amenities: {
        maxTwoBack: false,
        autoConfirm: false,
        smoking: false,
        pets: false,
      },
    });
  };

  const countInTimeRange = (startHour, endHour) => {
    return rides.filter((r) => {
      const hour = new Date(r.departureTime).getHours();
      return hour >= startHour && hour <= endHour;
    }).length;
  };

  const formatDateLabel = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("sr-RS", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const isFilterActive =
    JSON.stringify(filters) !==
    JSON.stringify({
      sortBy: "earliest",
      timeRange: [],
      amenities: {
        maxTwoBack: false,
        autoConfirm: false,
        smoking: false,
        pets: false,
      },
    });

  if (!user)
    return (
      <div className="p-50 text-center">
        <h2>Niste prijavljeni.</h2>
      </div>
    );

  return (
    <div className="dashboard-wrapper">
      <div className="search-section-full">
        <div className="container">
          <form className="search-bar" onSubmit={handleSearch}>
            <input
              type="text"
              name="startCity"
              placeholder="Odakle putujete?"
              onChange={handleInputChange}
              className="search-input start"
              required
            />
            <input
              type="text"
              name="endCity"
              placeholder="Gde želite da idete?"
              onChange={handleInputChange}
              className="search-input"
              required
            />
            <input
              type="date"
              name="date"
              onChange={handleInputChange}
              className="search-input"
              required
            />
            <input
              type="number"
              name="seats"
              min="1"
              value={searchParams.seats}
              onChange={handleInputChange}
              className="search-input"
              required
            />
            <button type="submit" className="search-btn">
              Pretrazite
            </button>
          </form>
        </div>
      </div>

      <div className="main-content-area">
        {!hasSearched ? (
          <div className="empty-state-msg">
            <p>
              Nakon sto unesete podatke za pretragu, vase voznje ce biti
              prikazane.
            </p>
          </div>
        ) : (
          <div className="container dashboard-content">
            <aside className="filters-sidebar">
              <div className="filter-group">
                <div className="filter-header">
                  <label>Poredjajte po</label>
                  <button
                    className="btn-link"
                    onClick={resetFilters}
                    disabled={!isFilterActive}
                  >
                    Izbrisite sve
                  </button>
                </div>
                <div className="selection-list">
                  <label className="control-item">
                    <input
                      type="radio"
                      name="sortBy"
                      value="earliest"
                      checked={filters.sortBy === "earliest"}
                      onChange={(e) =>
                        setFilters({ ...filters, sortBy: e.target.value })
                      }
                    />
                    Najranije vreme polaska
                  </label>
                  <label className="control-item">
                    <input
                      type="radio"
                      name="sortBy"
                      value="price"
                      checked={filters.sortBy === "price"}
                      onChange={(e) =>
                        setFilters({ ...filters, sortBy: e.target.value })
                      }
                    />
                    Najniza cena
                  </label>
                </div>
              </div>

              <div className="filter-group">
                <label className="section-label">Vreme polaska</label>
                <div className="selection-list">
                  <label className="control-item">
                    <input
                      type="checkbox"
                      checked={filters.timeRange.includes("morning")}
                      onChange={(e) => {
                        const val = "morning";
                        setFilters((f) => ({
                          ...f,
                          timeRange: e.target.checked
                            ? [...f.timeRange, val]
                            : f.timeRange.filter((t) => t !== val),
                        }));
                      }}
                    />
                    06:00 - 12:00 <span>({countInTimeRange(6, 12)})</span>
                  </label>
                  <label className="control-item">
                    <input
                      type="checkbox"
                      checked={filters.timeRange.includes("afternoon")}
                      onChange={(e) => {
                        const val = "afternoon";
                        setFilters((f) => ({
                          ...f,
                          timeRange: e.target.checked
                            ? [...f.timeRange, val]
                            : f.timeRange.filter((t) => t !== val),
                        }));
                      }}
                    />
                    12:01 - 18:00 <span>({countInTimeRange(12, 18)})</span>
                  </label>
                </div>
              </div>

              <div className="filter-group">
                <label className="section-label">Sadržaji</label>
                <div className="selection-list">
                  <label className="control-item">
                    <input
                      type="checkbox"
                      checked={filters.amenities.maxTwoBack}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          amenities: {
                            ...filters.amenities,
                            maxTwoBack: e.target.checked,
                          },
                        })
                      }
                    />
                    Najvise 2 na zadnjem sedistu
                  </label>
                  <label className="control-item">
                    <input
                      type="checkbox"
                      checked={filters.amenities.autoConfirm}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          amenities: {
                            ...filters.amenities,
                            autoConfirm: e.target.checked,
                          },
                        })
                      }
                    />
                    Automatska rezervacija
                  </label>
                  <label className="control-item">
                    <input
                      type="checkbox"
                      checked={filters.amenities.smoking}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          amenities: {
                            ...filters.amenities,
                            smoking: e.target.checked,
                          },
                        })
                      }
                    />
                    Dozvoljeno pusenje
                  </label>
                  <label className="control-item">
                    <input
                      type="checkbox"
                      checked={filters.amenities.pets}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          amenities: {
                            ...filters.amenities,
                            pets: e.target.checked,
                          },
                        })
                      }
                    />
                    Ljubimci su dozvoljeni
                  </label>
                </div>
              </div>
            </aside>

            <main className="results-container">
              <div className="results-header">
                <div className="search-info">
                  <strong>
                    {formatDateLabel(searchParams.date)} ·{" "}
                    {searchParams.startCity} → {searchParams.endCity}
                  </strong>
                </div>
                <div className="results-count">
                  {filteredRides.length} dostupnih voznji
                </div>
              </div>
              <div className="rides-list">
                {filteredRides.map((ride) => (
                  <RideCard
                    key={ride.id}
                    ride={ride}
                    requestedSeats={searchParams.seats}
                  />
                ))}
                {filteredRides.length === 0 && (
                  <p className="no-results">
                    Nema voznji koje odgovaraju zadatim filterima.
                  </p>
                )}
              </div>
            </main>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
