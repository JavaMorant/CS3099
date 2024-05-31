import './index.css';
import 'regenerator-runtime/runtime'
import React from 'react';
import ReactDOM from 'react-dom/client';
import { reportWebVitals } from './reportWebVitals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { DarkModeProvider } from './context/DarkModeContext';

import NoPage from './pages/nopage/NoPage';
import MainPage from './pages/main/Main';
import Group31 from './pages/group31/group31';
import Group32 from './pages/group32/Group32';
import Layout from './pages/layout/Layout';
import TeamHub from './group33/pages/teamhub/TeamHub';
import LandingPage from './pages/LandingPage/LandingPage';

//group33 imports
import PlayerPage from './group33/pages/PlayerPage/PlayerPage';
import PlayerHub from './group33/pages/playerhub/PlayerHub';
import LoadingPage from './group33/pages/loadingPage/LoadingPage';
import StadiumPage from './pages/group34_pages/stadium/Stadium';
const queryClient = new QueryClient();

/**
 * The main wrapper for the app.
 * Implements the routing system of the app.
 * Each route is given a path and an element to render when that path is visited.
 */
export const AppWrapper = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter basename="/">
      <Routes>
        <Route element={<Layout />}>
          {/* To do routes with arguments, you can use the following syntax: path="/test/:id" */}
          <Route index element={<LandingPage />} /> {/* This is the default (index) route */}
          <Route path="/stadium" element={<StadiumPage />} /> {/* Routes to stadium page */}
          <Route path="/group32" element={<Group32 />} /> {}
          {/* group33 team page */}
          <Route path="/PlayerPage/:StrPlayerData" element={<PlayerPage />} />
          <Route path="/TeamHub" element={<TeamHub />} />
          <Route path="/team/:teamID" element={<PlayerHub />} />
          <Route path="/LoadingPage" element={<LoadingPage />} />
          <Route path="/NodeGraph" element={<Group31 />} /> {/* My custom route */}
          <Route path="/Home" element={<LandingPage />} /> {/* My custom route */}
          {/* This is the 404 route - routes any path that does not match the previous ones */}
          <Route path="*" element={<NoPage />} />{' '}
        </Route>
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

/**
 * The main render function for the app. Renders the AppWrapper component in a strict mode.
 */
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <DarkModeProvider>
    <AppWrapper />
    </DarkModeProvider>
  </React.StrictMode>
  
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
