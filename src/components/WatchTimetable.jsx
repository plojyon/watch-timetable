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

		this.getEvents = this.getEvents.bind(this);
		this.getNextEvent = this.getNextEvent.bind(this);
	}

	getEvents() {
		let events = []
		for (let i in this.state.timetable) {
			let begin = {
				abbr: this.state.timetable[i].predmet.abbr,
				time: this.state.timetable[i].ura,
				day: this.state.timetable[i].dan,
				type: "start"
			}
			let end = {
				abbr: this.state.timetable[i].predmet.abbr,
				time: this.state.timetable[i].ura + this.state.timetable[i].trajanje,
				day: this.state.timetable[i].dan,
				type: "end"
			}
			events.push(begin);
			events.push(end);
		}
		return events;
	}
	getNextEvent(current) {
		let upcoming = [];
		let events = this.getEvents();
		console.log("events",events);
		events.forEach((event, i) => {
			if (event.day === ((current.getDay() + 6) % 7)) {
				let eventTime = new Date(current.getTime());
				eventTime.setHours(event.time);
				eventTime.setMinutes(0);
				if (event.type === "start") eventTime.setMinutes(15); // hmm

				let diff = eventTime.getTime() - current.getTime();
				console.log(event," in ",diff)
				if (diff > 0) {
					event.eta = {}
					event.eta.ms = diff;
					event.eta.str = ""
					let min = Math.floor((diff/1000)/60);
					let hour = Math.floor(min/60);
					min %= 60;
					if (hour !== 0)
						event.eta.str += hour+" h ";
					if (min !== 0)
						event.eta.str += min + " min ";
					if (hour === 0 && min === 0)
						event.eta.str = "0";

					event.eta.str.slice(0, -1); // remove trailing space
					upcoming.push(event);
				}
			}
		});

		if (upcoming.length === 0) return {type: "none"};

		upcoming.sort((a, b) => a.eta.ms - b.eta.ms);
		console.log("upcoming",upcoming)
		return upcoming[0];
	}

	render() {
		let logoSize = 90;

		let current = new Date();
		let today = (current.getDay() + 6) % 7;
		let timeRotation = current.getHours() * (360/12) - 90;
		timeRotation += current.getMinutes() * ((360/12)/60);
		let fontsizeDay = 14;
		let fontsizeStatus = 10;
		let status = "error" // "36 min of ARS left", "ANA in 17 min", "Done for today"
		let upcoming = this.getNextEvent(current);
		if (upcoming.type === "none") status = "Done for today"
		if (upcoming.type === "start") status = upcoming.abbr + " in "+upcoming.eta.str;
		if (upcoming.type === "end") status = upcoming.eta.str+" of "+upcoming.abbr+" left";

		let eventWidth = 12;
		let margin = 2;
		let initialMargin = 5;
		// 5 + 15 + 5 + 5 + 15 + 5 + 5 + 15 + 5
		// --event----|---event2---|---event3---
		let layerStart = (layer) => (eventWidth+2*margin)*layer + initialMargin;

		return (
			// Circular viewport
			<div style={{
				backgroundColor: this.state.colorScheme["background"],

				borderRadius: "50%",

				width: 360+'px',
				height: 360+'px'
			}}>
				{
					[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((day) => {
						// cosmetic div: darker circles every even day
						return <div style={{
							backgroundColor: (day % 2)?
								this.state.colorScheme["background"] :
								this.state.colorScheme["background2"],
							borderRadius: "50%",
							width: (360 - 2*layerStart(day))+'px',
							height: (360 - 2*layerStart(day))+'px',
							position: "fixed",
							top: (layerStart(day)) + 'px',
							left: (layerStart(day)) + 'px',
						}} />
					})
				}
				{
					[0, 1, 2, 3, 4].map((day, i) => {
						return this.state.timetable.map((lecture, j) => {
							if (day === lecture.dan)
								return <Event
									key={i + '_' + j}
									id={i + '_' + j}
									start={lecture.ura}
									end={lecture.ura + lecture.trajanje}
									color={this.state.colorScheme[lecture.predmet.color]}
									textColor={this.state.colorScheme["backgound"]}
									text={lecture.predmet.abbr}
									fontSize={ eventWidth - 3 }
									outline="none"
									size={ eventWidth }
									outerMargin={ layerStart(day) }
									padding={ margin }
									background={
										day % 2?
										this.state.colorScheme["background"] :
										this.state.colorScheme["background2"]
									}
									dim={(lecture.dan === today)? false:true}
								/>
							else return undefined;
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
				<img src="logo192.png" alt="logo" style={{
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
					fontWeight: "bold",
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
					fontWeight: "bold",
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
