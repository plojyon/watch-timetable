import React, { Component } from "react";
import './App.css';
import WatchTimetable from './components/WatchTimetable.jsx'


const colorScheme = {
	background: "#222222",
	background2: "#2c2c2d",
	hand: "red", // clock hand colour
	text: "white",

	red: "#ff6188",
	orange: "#fc9868",
	yellow: "#ffd866",
	green: "#a9de77",
	blue: "#78dce8",
	purple: "#ab9df2"
}

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			timetable: false,
			api_url: props.api_url || "https://yon.si/urnik.php",
			error: false
		}

		this.fetchTableData = this.fetchTableData.bind(this);
	}

	componentDidMount() {
		// can't call setState if component hasn't mounted yet
		this.fetchTableData();
	}

	async fetchTableData() {
		var response = await fetch(
			this.state.api_url,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					// 'Content-Type': 'application/x-www-form-urlencoded',
				},
			}
		);


		if (response.ok) {
			let data = await response.json();
			//data = this.handleDuplicates(data);
			console.log(data)
			this.setState({timetable: data});
		} else {
			console.error(response);
			this.setState( { error: "error fetching timetable: " + response.status + ": " + response.statusText } );
			return 0;
		}
	}


	render() {
		if (!this.state.timetable) return <p style={{textAlign: 'center'}}>Loading</p>;
		return (
			<div className="App">
				<WatchTimetable timetable={this.state.timetable} colorScheme={colorScheme} refreshTimetable={this.fetchTableData} />
			</div>
		);
	}
}

export default App;
