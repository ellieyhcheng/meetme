import React from 'react';
import './App.scss';
import Header from './components/Header/Header';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
// import Calendar from './components/Calendar/Calendar';
// import Button from './components/Button/Button';
import Create from './pages/Create/Create';

function App() {

	return (
		<Router>
			<div className="App">
				<Header />

				<Switch>
					<Route path="/find">
						<p>Find me a event pls</p>
					</Route>
					<Route path="/">
						<Create/>
					</Route>
				</Switch>

			</div>
		</Router>
	);
}

export default App;
