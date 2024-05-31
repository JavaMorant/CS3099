import { Outlet } from 'react-router-dom';
import { Navbar } from '../../components/Layout/Navbar';
import GeneralFallback from '../../components/Layout/Fallback/GeneralFallback';

const Layout = () => {
  return (
    <GeneralFallback>
      <Navbar />
      <Outlet />
    </GeneralFallback>
  );
};

export default Layout;
