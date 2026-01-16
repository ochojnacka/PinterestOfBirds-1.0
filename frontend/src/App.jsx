import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import Header from './components/Header';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BirdGrid from './components/BirdGrid';
import UploadForm from './components/UploadForm';
import LogInBtn from './components/LogInBtn';
import LogInWndw from './components/LogInWndw';

// API URL - use Vite env variable or default to relative path
const API_URL = import.meta.env.VITE_API_URL || '/api';

function App() {
  const [favorites, setFavorites] = useState([]);
  const [birds, setBirds] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('idToken');
    const accessToken = localStorage.getItem('accessToken');
    setIsLoggedIn(!!(token || accessToken));
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (tokens) => {
    // Store tokens from Cognito
    if (tokens.idToken) localStorage.setItem('idToken', tokens.idToken);
    if (tokens.accessToken) localStorage.setItem('accessToken', tokens.accessToken);
    if (tokens.refreshToken) localStorage.setItem('refreshToken', tokens.refreshToken);
    
    setIsLoggedIn(true);
    navigate('/');
    // useEffect will handle loading favorites when isLoggedIn changes
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setFavorites([]);
    localStorage.removeItem('idToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/');
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('idToken') || localStorage.getItem('accessToken');
    if (!token) return {};
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const loadBirds = async () => {
    try {
      const res = await fetch(`${API_URL}/birds`);
      if (res.ok) {
        const data = await res.json();
        // Transform backend data to match frontend structure
        const transformedBirds = data.map(bird => ({
          id: bird.birdId || bird.id,
          name: bird.name,
          description: bird.description,
          imageUrl: bird.birdPicture || bird.imageUrl,
        }));
        setBirds(transformedBirds);
      }
    } catch (err) {
      console.error('Błąd ładowania ptaków:', err);
    }
  };

  const loadFavorites = async () => {
    if (!isLoggedIn) return;
    
    try {
      const res = await fetch(`${API_URL}/favorites`, {
        headers: getAuthHeaders(),
      });
      
      if (res.ok) {
        const data = await res.json();
        // Backend returns favorites with userId and birdId
        // We need to get the full bird data
        const favoriteBirdIds = data.map(fav => fav.birdId);
        const favoriteBirds = birds.filter(bird => 
          favoriteBirdIds.includes(bird.id)
        );
        setFavorites(favoriteBirds);
      } else if (res.status === 401) {
        // Token expired or invalid
        handleLogout();
      }
    } catch (err) {
      console.error('Błąd ładowania ulubionych:', err);
    }
  };

  const toggleFavorite = async (birdId) => {
    // If not logged in, redirect to login
    if (!isLoggedIn) {
      navigate('/login', { 
        state: { message: 'Zaloguj się, aby dodawać ptaki do ulubionych!' } 
      });
      return;
    }

    const token = localStorage.getItem('idToken') || localStorage.getItem('accessToken');
    if (!token) {
      handleLogout();
      return;
    }

    // Check if already favorite (from backend data structure)
    const isAlreadyFavorite = favorites.some(fav => 
      String(fav.id || fav.birdId) === String(birdId)
    );

    try {
      if (isAlreadyFavorite) {
        // Remove from favorites
        const res = await fetch(`${API_URL}/favorites/${birdId}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });

        if (res.ok) {
          setFavorites(favorites.filter(fav => 
            String(fav.id || fav.birdId) !== String(birdId)
          ));
        } else if (res.status === 401) {
          handleLogout();
        }
      } else {
        // Add to favorites
        const res = await fetch(`${API_URL}/favorites/${birdId}`, {
          method: 'POST',
          headers: getAuthHeaders(),
        });

        if (res.ok) {
          const birdToAdd = birds.find(b => String(b.id) === String(birdId));
          if (birdToAdd) {
            setFavorites([...favorites, birdToAdd]);
          }
        } else if (res.status === 401) {
          handleLogout();
        }
      }
    } catch (err) {
      console.error('Błąd podczas zmiany ulubionych:', err);
    }
  };

  // Load birds on mount and when location changes
  useEffect(() => {
    loadBirds();
  }, []);

  // Load favorites when logged in status changes or location changes
  useEffect(() => {
    if (isLoggedIn) {
      loadFavorites();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, location.pathname]);

  // Sync favorites with birds data when birds are loaded
  useEffect(() => {
    if (isLoggedIn && birds.length > 0) {
      loadFavorites();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [birds.length, isLoggedIn]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">Ładowanie...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <Header />

      {location.pathname !== '/login' && (
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          {!isLoggedIn ? (
            <LogInBtn />
          ) : (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-red-700 transition-all active:scale-95"
            >
              Log Out
            </button>
          )}
        </div>
      )}

      {location.pathname !== '/login' && <Navbar />}

      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <BirdGrid
                    birds={birds}
                    onFavorite={toggleFavorite}
                    favorites={favorites}
                  />
                </motion.div>
              }
            />

            <Route
              path="/favorites"
              element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {isLoggedIn ? (
                    <BirdGrid
                      birds={favorites}
                      onFavorite={toggleFavorite}
                      favorites={favorites}
                    />
                  ) : (
                    <Navigate
                      to="/login"
                      state={{ message: 'Zaloguj się, aby zobaczyć ulubione ptaki!' }}
                      replace
                    />
                  )}
                </motion.div>
              }
            />

            <Route
              path="/upload"
              element={
                isLoggedIn ? (
                  <UploadForm
                    API_URL={API_URL}
                    getAuthHeaders={getAuthHeaders}
                    onBirdAdded={() => {
                      loadBirds();
                      navigate('/');
                    }}
                  />
                ) : (
                  <Navigate
                    to="/login"
                    state={{ message: 'Musisz być zalogowany, aby dodać nowego ptaka!' }}
                    replace
                  />
                )
              }
            />

            <Route
              path="/login"
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center items-center min-h-[60vh]"
                >
                  <LogInWndw onLoginSuccess={handleLoginSuccess} />
                </motion.div>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

export default App;
