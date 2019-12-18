import React from 'react';
import './App.css';
import Header from './components/Header/Header';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Calendar from './components/Calendar/Calendar';
// import Moment from "react-moment";

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
						<p>yeet yote this is the default</p>
						<Calendar/>
					</Route>
				</Switch>

			</div>
		</Router>
	);
}

export default App;
