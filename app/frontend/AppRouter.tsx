import HomeLayout from 'layouts/HomeLayout';
import EngagementIndex from 'pages/EngagementIndex';
import { Navigate, Route, Routes } from 'react-router';

import EngagementShow from 'components/EngagementShow';
import { ChainedAsync } from 'components/ChainedAsync';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeLayout />}>
        <Route index element={<EngagementIndex />} />
        <Route path="engagements/:id/edit" element={<EngagementShow />} />
        <Route path="async/" element={<ChainedAsync />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />}></Route>
    </Routes>
  );
};

export default AppRouter;
