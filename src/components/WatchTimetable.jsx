import React, { Component } from "react";
import Event from './Event.jsx'
import styled from "styled-components";

class WatchTimetable extends Component {
	constructor(props) {
		super(props);
		this.state = {
			timetable: this.props.timetable,
			background: this.props.background,
			day: this.props.day,
			colorScheme: this.props.colorScheme
		}
	}

	render() {
		return (
			<div style={{
				backgroundColor: this.state.colorScheme["background"],

				border: "1px solid black",
				borderRadius: "50%",

				width: "358px",
				height: "358px" /* -2 px due to the border */
			}}>
				{
					[0,1,2,3,4].map((day, i) => {
						return this.state.timetable.map((lecture, j) => {
							if (day == lecture.dan)
							return <Event
								key={i + ' ' + j}
								start={lecture.ura}
								end={lecture.ura + lecture.trajanje}
								color={this.state.colorScheme[lecture.predmet.color]}
								size="10"
								padding={ (15 * lecture.dan + 5)}
								background={this.state.colorScheme["background"]}
							/>
						})
					})
				}
			</div>
		);
	}
}

export default WatchTimetable;
