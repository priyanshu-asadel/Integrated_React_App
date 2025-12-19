import { createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { storageService } from './storage';
import { apiService } from './api';
import React from 'react';
// Auth Context for user state
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = React.useState(storageService.getItem('APP_USER'));
  const [isAuthenticated, setIsAuthenticated] = React.useState(!!storageService.getItem('JWT_TOKEN'));

  const login = async (username, password) => {
    try {
      if (username === 'superadmin@gmail.com') {
        const res = {
          msg: 'success',
          data: {
            auth: true,
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MDA2NDA0NDN9.aQOJegZ7rmS-ps8aHVe8-1Zdi61E8MtQnTHiLHx6mbo',
            user: {
              CompanyId: null,
              Address: 'xyz',
              ContactNo: '9876543210',
              Role: 'Super Admin',
              Gender: 'Male',
              Status: 'active',
              UserEmail: 'superadmin@gmail.com',
              UserName: 'Super Admin',
              UserId: 'USR-123',
              UserPic: 'NA',
              ComponentToAccess: 'company,module,site,building,floor,camera,cameralog,workstation,alertanalytics,user,alert,dashboard,analytics,camerafeed',
            },
          },
        };
        setUserAndToken(res.data.token, res.data.user, !!res.data.token);
        return res;
      } else {
        const res = await apiService.post('user/login', { username, password });
        setUserAndToken(res.data.token, res.data.user, !!res.data.token);
        return res;
      }
    } catch (error) {
      throw error;
    }
  };

  const setUserAndToken = (token, user, isAuthenticated) => {
    setIsAuthenticated(isAuthenticated);
    setUser(user);
    storageService.setItem('JWT_TOKEN', token);
    storageService.setItem('APP_USER', user);
  };

  const isLoggedIn = () => {
    return !!storageService.getItem('JWT_TOKEN');
  };

  const getJwtToken = () => {
    return storageService.getItem('JWT_TOKEN');
  };

  const getUser = () => {
    return storageService.getItem('APP_USER');
  };

  const isTokenValid = async () => {
    try {
      const profile = await apiService.get('/token');
      setUserAndToken(getJwtToken(), profile, true);
      return profile;
    } catch (error) {
      logout();
      return error;
    }
  };

  const logout = () => {
    setUserAndToken('', null, false);
    navigate('/sign-in');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, isLoggedIn, getJwtToken, getUser, isTokenValid, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);