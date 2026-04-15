import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import RideDetails from "./pages/RideDetails";
import Dashboard from "./pages/Dashboard";
import CreateRide from "./pages/CreateRide";
import Navbar from "./components/Navbar";
import Profile from "./pages/Profile";
import UserRatings from "./pages/UserRatings";
import { useAuthStore } from "./store/useAuthStore";
import useNotificationStore from "./store/useNotificationStore";
import Requests from "./pages/Requests";
import MyRides from "./pages/MyRides";
import RateRide from "./pages/RateRide";
import NotificationsPage from "./pages/NotificationsPage";
import ChatPage from "./pages/ChatPage";

function App() {
  const { user, token } = useAuthStore();
  const { startConnection, stopConnection } = useNotificationStore();

  useEffect(() => {
    if (user && token) {
      startConnection(token, user.id);
    } else {
      stopConnection();
    }
  }, [user, token, startConnection, stopConnection]);

  return (
    <Router>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              user ? <Navigate to="/dashboard" replace /> : <LandingPage />
            }
          />
          <Route
            path="/auth"
            element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />}
          />

          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <Navigate to="/" replace />}
          />
          <Route
            path="/rides/:id"
            element={user ? <RideDetails /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/create-ride"
            element={user ? <CreateRide /> : <Navigate to="/auth" replace />}
          />
          <Route path="/requests" element={<Requests />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/profile/:id/ratings" element={<UserRatings />} />
          <Route path="/my-rides" element={<MyRides />} />
          <Route path="/rate-ride/:rideId" element={<RateRide />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:userId" element={<ChatPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
