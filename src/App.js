import React from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import './assets/scss/styles.scss';
import LandingPage from "./pages/LandingPage";
import DetailPage from "./pages/DetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import TermPage from "./pages/TermPage";
import PrivacyPage from "./pages/PrivacyPage";

function App() {
  return (
    <div className='App'>
      <Router>
          <Route path='/' exact component={LandingPage}></Route>
          <Route path='/properties/:id' component={DetailPage}></Route>
          <Route path='/checkout' component={CheckoutPage}></Route>
          <Route path='/terms' component={TermPage}></Route>
          <Route path='/privacy' component={PrivacyPage}></Route>
      </Router>
    </div>
  );
}

export default App;
