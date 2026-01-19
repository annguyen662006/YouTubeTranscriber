import React from 'react';
import Layout from './components/Layout';
import HomeView from './components/HomeView';
import LoadingView from './components/LoadingView';
import ResultView from './components/ResultView';
import ErrorView from './components/ErrorView';
import { useTranscriptionStore } from './store';

const App: React.FC = () => {
  const { status } = useTranscriptionStore();

  let content;

  switch (status) {
    case 'loading':
      content = <LoadingView />;
      break;
    case 'success':
      content = <ResultView />;
      break;
    case 'error':
      content = <ErrorView />;
      break;
    case 'idle':
    default:
      content = <HomeView />;
      break;
  }

  return (
    <Layout>
      {content}
    </Layout>
  );
};

export default App;
