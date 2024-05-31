import './styles.css';
import StadiumMap from '../../../components/group34_components/StadiumMap';
import { AppContextProvider } from './AppContext'

const StadiumPage = () => {
  return (
  <AppContextProvider>
    <div className="py-0 mx-0 w-screen h-screen">
      <StadiumMap />
    </div>
  </AppContextProvider>
  );
};

export default StadiumPage;
