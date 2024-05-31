import { Link as RouterLink } from 'react-router-dom';
import { Icon } from '../../components/common/Icons';

import './NoPage.css';

const NoPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex items-end gap-5 text-[150px] font-bold font-['Poppins'] text-indigo-500">
        <div className="flex h-full items-center">
          <span className="align">4</span>
        </div>
        <div className="flex items-start mb-16">
          <Icon name="Logo" className="Logo-view w-40 h-40" />
        </div>
        <div className="flex h-full items-center">
          <span className="align">4</span>
        </div>
      </div>
      <div className="flex flex-col gap-20 items-center">
        <div className="flex flex-col gap-2 items-center">
          <p className="text-black text-[35px] font-semibold font-['Poppins']">
            The ref blew the whistle on this page
          </p>
          <p className="text-black text-[28px] font-normal font-['Poppins']">
            This page is out of play.
          </p>
        </div>
        <RouterLink to="/">
          <button className="w-[273px] h-[75px] bg-indigo-500 rounded-full text-white text-[25px] font-normal font-['Poppins']">
            Go Home
          </button>
        </RouterLink>
      </div>
    </div>
  );
};

export default NoPage;
