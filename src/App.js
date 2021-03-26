import React, { Component } from "react";
import './App.css';
import WatchTimetable from './components/WatchTimetable.jsx'

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
		this.fetchTableData().then(data => this.setState({timetable: data}));
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
			return data;
		} else {
			console.error(response);
			this.setState( { error: response.status + ": " + response.statusText } );
			return 0;
		}
	}


	render() {
		if (!this.state.timetable) return <p style={{textAlign: 'center'}}>Loading</p>;
		return (
			<div className="App">
				<WatchTimetable data={this.state.timetable} />
			</div>
		);
	}
}

export default App;
