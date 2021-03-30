import React, { Component } from "react";
import Event from './Event.jsx'

const watchSize = 360;
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const logoSize = 90;
const eventWidth = 15;
const margin = 2;
const initialMargin = 5;
// 2 + 12 + 2 + 2 + 12 + 2 + 2 + 12 + 2
// --event----|---event2---|---event3---
const layerStart = (layer) => (eventWidth+2*margin)*layer + initialMargin;

const fontSize = {day: 10, status: 10};
// if you change fontSize, you will need to add a constant term to the appropriate textRadius
// I call it radius +C, and Leibniz did it first
const textRadius = {
	status: watchSize/2 - layerStart(6) + (eventWidth+2*margin - fontSize.status*1.4),
	day: watchSize/2 - layerStart(5) - fontSize.day*1.4/2 +2 // fuck it, +2px
}

const refreshInterval = 5 * 1000; // in milliseconds

class WatchTimetable extends Component {
	constructor(props) {
		super(props);
		this.state = {
			timetable: this.props.timetable,
			background: this.props.background,
			day: this.props.day,
			colorScheme: this.props.colorScheme,

			currentTime: new Date(),
			status: "error", // "36 min of ARS left", "LINALG in 1h 17 min", "Done for today"

			interval: 0
		}

		this.getEvents = this.getEvents.bind(this);
		this.getNextEvent = this.getNextEvent.bind(this);
		this.refresh = this.refresh.bind(this);
	}

	componentDidMount() {
		let interval_id = setInterval(this.refresh, refreshInterval);
		this.setState({interval: interval_id})
		this.refresh();
	}
	componentWillUnmount() {
		clearInterval(this.state.interval);
	}

	refresh() {
		let currentTime = new Date();

		let today = (currentTime.getDay() + 6) % 7;
		let timeRotation = currentTime.getHours() * (watchSize/12) - 90;
		timeRotation += currentTime.getMinutes() * ((watchSize/12)/60);

		let status = "";
		let upcoming = this.getNextEvent(currentTime);
		if (upcoming.type === "none") status = "Done for today";
		if (upcoming.type === "start") status = upcoming.abbr + " in "+upcoming.eta.str;
		if (upcoming.type === "end") status = upcoming.eta.str+" of "+upcoming.abbr+" left";

		this.setState({ currentTime: currentTime, today: today, timeRotation: timeRotation, status: status });
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
		events.forEach((event, i) => {
			if (event.day === ((current.getDay() + 6) % 7)) {
				let eventTime = new Date(current.getTime());
				eventTime.setHours(event.time);
				eventTime.setMinutes(0);
				//if (event.type === "start") eventTime.setMinutes(15); // hmm

				let diff = eventTime.getTime() - current.getTime();
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
		return upcoming[0];
	}

	render() {
		// fucking react and their fucking state updates fuckery
		if (this.state.today === undefined) return <p>Loading...</p>;

		return (
			// Circular viewport
			<div style={{
				backgroundColor: this.state.colorScheme["background"],

				borderRadius: "50%",

				width: watchSize+'px',
				height: watchSize+'px'
			}}>
				{
					// cosmetic div: darker circles every even day
					[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((day) => {
						return <div key={day} style={{
							backgroundColor: (day % 2)?
								this.state.colorScheme["background"] :
								this.state.colorScheme["background2"],
							borderRadius: "50%",
							width: (watchSize - 2*layerStart(day))+'px',
							height: (watchSize - 2*layerStart(day))+'px',
							position: "fixed",
							top: (layerStart(day)) + 'px',
							left: (layerStart(day)) + 'px',
						}} />
					})
				}
				{
					// lectures
					this.state.timetable.map((lecture, i) => {
						return <Event
							key={i}
							id={i}
							start={lecture.ura}
							end={lecture.ura + lecture.trajanje}
							color={this.state.colorScheme[lecture.predmet.color]}
							textColor={this.state.colorScheme["background"]}
							text={lecture.predmet.abbr}
							fontSize={ eventWidth -2 }
							size={ eventWidth }
							outerMargin={ layerStart(lecture.dan) }
							padding={ margin }
							background={
								lecture.dan % 2?
								this.state.colorScheme["background"] :
								this.state.colorScheme["background2"]
							}
							dim={(lecture.dan === this.state.today)? false:true}
						/>
					})
				}

				{/* clock hand */}
				<div style={{
					position: "absolute",
					top: (watchSize/2) + 'px',
					left: (watchSize/2) + 'px',
					width: (watchSize/2) + 'px',
					height: "3px",
					transform: "rotate("+ this.state.timeRotation +"deg)",
					transformOrigin: "0 0",
					backgroundColor: this.state.colorScheme["hand"]
				}} />

				{/* logo */}
				<img src="logo192.png" alt="logo" style={{
					position: "absolute",
					top: (watchSize/2 - logoSize/2) + 'px',
					left: (watchSize/2 - logoSize/2) + 'px',
					width: logoSize + 'px',
					height: logoSize + 'px'
				}} />

				{/* text trace svg */}
				<svg viewBox={"0 0 "+watchSize+" "+watchSize} style={{
					position: "absolute",
					top:"0",
					left: "0",
					width: watchSize+'px',
					height: watchSize+'px'
				}}>
					{/* text: current status */}
					<path id="curve_status" fill="none" d={
						" M "+watchSize/2+" "+watchSize/2
					+	" m -"+(textRadius.status)+", 0"
					+	" a "+(textRadius.status)+","+(textRadius.status)+" 0 1,1 "+(textRadius.status*2)+",0"
					}/>
					<text y="0" fontSize={(fontSize.status*1.4) + 'px'} style={{fill: this.state.colorScheme["text"]}}>
						<textPath xlinkHref={"#curve_status"} textAnchor="middle" startOffset="50%">
						{this.state.status}
						</textPath>
					</text>

					{/* text: day of the week */}
					<path id="curve_day" fill="none" d={
						" M "+watchSize/2+" "+watchSize/2
					+	" m -"+(textRadius.day)+", 0"
					+	" a "+(textRadius.day)+","+(textRadius.day)+" 0 1,0 "+(textRadius.day*2)+",0"
					}/>
					<text y="0" fontSize={(fontSize.day*1.4) + 'px'} style={{fill: this.state.colorScheme["text"]}}>
						<textPath xlinkHref={"#curve_day"} textAnchor="middle" startOffset="50%">
							{days[this.state.today]}
						</textPath>
					</text>
				</svg>
			</div>
		);
	}
}

export default WatchTimetable;
