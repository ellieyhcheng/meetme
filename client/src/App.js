import React from 'react';
import './App.scss';
import Header from './components/Header/Header';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Create from './pages/Create/Create';
import Event from './pages/Event/Event';

function App() {

	return (
		<Router>
			<div className="App">
				<Header />

				<Switch>
					{/* <Route path="/find">
						<p>Find me a event pls</p>
					</Route> */}
					<Route path="/:id">
						<Event/>
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
