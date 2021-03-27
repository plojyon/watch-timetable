import React, { Component } from "react";
import Event from './Event.jsx'

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

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
		let logoSize = 100;
		let today = 3;
		let timeRotation = 30;
		let fontsizeDay = 14;
		let fontsizeStatus = 10;
		let status = "36 min of ARS left" // "You're free", "ANA starting in 17 min"
		return (
			// Circular viewport
			<div style={{
				backgroundColor: this.state.colorScheme["background"],

				border: "1px solid black",
				borderRadius: "50%",

				width: (360 - 2)+'px',
				height: (360 - 2)+'px' /* -2 px due to the border */
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
								layer={ (15 * lecture.dan + 5)}
								background={
									day % 2?
									this.state.colorScheme["background"] :
									this.state.colorScheme["background2"]
								}
								dim={(lecture.dan == today)?0:1}
							/>
						})
					})
				}

				{/* clock hand */}
				<div style={{
					position: "absolute",
					top: (360/2) + 'px',
					left: (360/2) + 'px',
					width: (360/2) + 'px',
					height: "3px",
					transform: "rotate("+ timeRotation +"deg)",
					transformOrigin: "0 0",
					backgroundColor: this.state.colorScheme["hand"]
				}} />

				{/* logo */}
				<img src="logo192.png" style={{
					position: "absolute",
					top: (360/2 - logoSize/2) + 'px',
					left: (360/2 - logoSize/2) + 'px',
					width: logoSize + 'px',
					height: logoSize + 'px'
				}} />

				{/* text: name of day */}
				<p style={{
					color: this.state.colorScheme["text"],
					position: "absolute",
					fontSize: fontsizeDay + "px",
					top: (360/2 - logoSize/2 - fontsizeDay - 10) + 'px',
					left: 0,
					margin: 0,
					padding: 0,
					textAlign: "center",
					width: 360 + 'px'
				}}>{days[today]}</p>

				{/* text: daily status */}
				<p style={{
					color: this.state.colorScheme["text"],
					position: "absolute",
					fontSize: fontsizeStatus + "px",
					top: (360/2 + logoSize/2 + 10) + 'px',
					left: 0,
					margin: 0,
					padding: 0,
					textAlign: "center",
					width: 360 + 'px'
				}}>{status}</p>
			</div>
		);
	}
}

export default WatchTimetable;
