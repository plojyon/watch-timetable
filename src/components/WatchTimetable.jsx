import React, { Component } from "react";
import Event from './Event.jsx'


class WatchTimetable extends Component {
	constructor(props) {
		super(props);
		this.state = {}
	}

	render() {
		let timetable = ["hello wold"];
		return (
			<div>
				<p>I am timetable</p>
				<Event />
			</div>
		);
	}
}

export default WatchTimetable;
