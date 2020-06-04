import React from 'react';
import { Route, BrowserRouter } from 'react-router-dom';

import Home from './pages/Home';
import CreatePoint from './pages/CreatePoint';
import SearchPoints from './pages/SearchPoints';

const Routes = () => {
  return (
    <BrowserRouter>
    <Route component={Home} exact path='/' />
      <Route component={CreatePoint} path='/create-point' />
      <Route component={SearchPoints} path='/search-points' />
    </BrowserRouter>
  )
}

export default Routes;