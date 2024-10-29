import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import './index.scss'
import './styles/global.scss'

import ErrorPage from './error-page'
import Loading from './routes/components/Loading.jsx'
const Layout = lazy(() => import('./routes/layout.jsx'))
const UserLayout = lazy(() => import('./routes/userLayout.jsx'))
import Home, { loader as homeLoader } from './routes/home.jsx'
import About from './routes/about.jsx'
import Submit from './routes/submit.jsx'
import Create from './routes/create.jsx'
import Search from './routes/search.jsx'
import Admin from './routes/admin.jsx'
import Fee from './routes/fee.jsx'
import Owned from './routes/owned.jsx'
import TermsOfService from './routes/terms-of-service.jsx'
import PrivacyPolicy from './routes/privacy-policy.jsx'
import Dashboard from './routes/dashboard.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<Loading />}>
        <AuthProvider>
          <Layout />
        </AuthProvider>
      </Suspense>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        loader: homeLoader,
        element: <Home title={import.meta.env.VITE_SLOGAN} />,
      },
      {
        path: `submit`,
     children:[
      {
        index: true,
        element: <Search title={`Search`} />,
      },
      {
        path: `:pollId`,
        element: <Submit title={`Submit`} />,
      }
     ]
      },
        {
        path: `create`,
        element: <Create title={`Create`} />,
      },
      {
        path: `about`,
        element: <About title={`About`} />,
      },
      {
        path: `admin`,
        element: <Admin title={`Admin`} />,
      },
    ],
  },
  {
    path: 'user',
    element: (
      <Suspense fallback={<Loading />}>
        <AuthProvider>
          <UserLayout />
        </AuthProvider>
      </Suspense>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Dashboard to={`/dashboard`} replace />,
      },
      {
        path: `dashboard`,
        element: <Dashboard title={`Dashboard`} />,
      },
      {
        path: `transfer`,
        element: <Dashboard title={`Transfer`} />,
      },
      {
        path: `owned`,
        element: <Owned title={`Owned`} />,
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(<RouterProvider router={router} />)
