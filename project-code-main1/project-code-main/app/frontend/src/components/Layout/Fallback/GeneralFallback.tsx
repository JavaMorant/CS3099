import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { Icon } from '../../common/Icons/Icon';
import { Link as RouterLink } from 'react-router-dom';
import { ErrorInfo, ReactNode } from 'react';
import { logError as logErrorAPI } from '../../../api/services/logging';

import './GeneralFallback.css';

interface GeneralFallbackProps {
  children: ReactNode;
}

const logError = (error: Error, info: ErrorInfo) => {
  logErrorAPI(error, info.componentStack ? { componentStack: info.componentStack } : undefined);
};

function Fallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex items-end gap-5 text-[150px] font-bold font-['Poppins'] text-indigo-500">
        <div className="flex h-full items-center">
          <span className="align">5</span>
        </div>
        <div className="flex items-start mb-16">
          <Icon name="Logo" className="Logo-view w-40 h-40" />
        </div>
        <div className="flex items-start mb-16">
          <Icon name="Logo" className="Logo-view w-40 h-40" />
        </div>
      </div>
      <div className="flex flex-col gap-20 items-center">
        <div className="flex flex-col gap-5 items-center">
          <p className="text-black text-[35px] font-semibold font-['Poppins']">Oops!</p>
          <p className="text-black text-[28px] font-normal font-['Poppins']">
            Something went wrong :(
          </p>
          <p className="text-black text-[24px] font-base font-['Poppins']">
            {error?.message ?? 'Unknown error'}
          </p>
        </div>
        <div className="flex gap-5">
          <button
            onClick={() => resetErrorBoundary()}
            className="w-[273px] h-[75px] bg-indigo-500 rounded-full text-white text-[25px] font-normal font-['Poppins']">
            Try Again
          </button>
          <RouterLink to="/">
            <button
              onClick={() => resetErrorBoundary()}
              className="w-[273px] h-[75px] bg-indigo-500 rounded-full text-white text-[25px] font-normal font-['Poppins']">
              Go Home
            </button>
          </RouterLink>
        </div>
      </div>
    </div>
  );
}

const GeneralFallback = ({ children }: GeneralFallbackProps) => {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset} FallbackComponent={Fallback} onError={logError}>
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
    // <ErrorBoundary FallbackComponent={Fallback}>{children}</ErrorBoundary>
  );
};

export default GeneralFallback;
