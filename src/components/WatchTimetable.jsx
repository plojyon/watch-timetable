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
		let logoSize = 100;
		let today = 3;
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
								padding={ (15 * lecture.dan + 5)}
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
				<img src="logo192.png" style={{
					position: "absolute",
					top: (360/2 - logoSize/2) + 'px',
					left: (360/2 - logoSize/2) + 'px',
					width: logoSize + 'px',
					height: logoSize + 'px'
				}} />
			</div>
		);
	}
}

export default WatchTimetable;
