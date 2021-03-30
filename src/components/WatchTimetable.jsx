import React, { Component } from "react";
import Event from './Event.jsx'

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const fontsizeStatus = 10;
const fontsizeDay = 10;
const logoSize = 90;
const textRadius = 130;
const eventWidth = 15;
const margin = 2;
const initialMargin = 5;
// 2 + 12 + 2 + 2 + 12 + 2 + 2 + 12 + 2
// --event----|---event2---|---event3---
const layerStart = (layer) => (eventWidth+2*margin)*layer + initialMargin;

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
		}

		this.getEvents = this.getEvents.bind(this);
		this.getNextEvent = this.getNextEvent.bind(this);
		this.refresh = this.refresh.bind(this);
	}

	componentDidMount() {
		setInterval(this.refresh, refreshInterval);
		this.refresh();
	}

	refresh() {
		let currentTime = new Date();

		let today = (currentTime.getDay() + 6) % 7;
		let timeRotation = currentTime.getHours() * (360/12) - 90;
		timeRotation += currentTime.getMinutes() * ((360/12)/60);

		let status = "";
		let upcoming = this.getNextEvent(currentTime);
		if (upcoming.type === "none") status = "Done for today";
		if (upcoming.type === "start") status = upcoming.abbr + " in "+upcoming.eta.str;
		if (upcoming.type === "end") status = upcoming.eta.str+" of "+upcoming.abbr+" left";

		this.setState({ currentTime, today, timeRotation, status });
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
		return (
			// Circular viewport
			<div style={{
				backgroundColor: this.state.colorScheme["background"],

				borderRadius: "50%",

				width: 360+'px',
				height: 360+'px'
			}}>
				{
					// cosmetic div: darker circles every even day
					[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((day) => {
						return <div key={day} style={{
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
							fontSize={ eventWidth - 3 }
							outline="none"
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
					top: (360/2) + 'px',
					left: (360/2) + 'px',
					width: (360/2) + 'px',
					height: "3px",
					transform: "rotate("+ this.state.timeRotation +"deg)",
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

				{/* text trace svg */}
				<svg viewBox="0 0 360 360" style={{
					position: "absolute",
					top:"0",
					left: "0",
					width: '360px',
					height: '360px'
				}}>
					{/* text: current status */}
					<path id="curve_status" fill="none" d={
						"M "+360/2+" "+360/2
					+	"m -"+(textRadius/2)+", 0"
					+	"a "+(textRadius/2)+","+(textRadius/2)+" 0 1,1 "+(textRadius)+",0"
					}/>
					<text y="0" fontSize={(fontsizeStatus*1.4) + 'px'} style={{fill: this.state.colorScheme["text"]}}>
						<textPath xlinkHref={"#curve_status"} textAnchor="middle" startOffset="50%">
						{this.state.status}
						</textPath>
					</text>

					{/* text: day of the week */}
					<path id="curve_day" fill="none" d={
						" M "+360/2+" "+360/2
					+	" m -"+(textRadius/2)+", 0"
					+	" a "+(textRadius/2)+","+(textRadius/2)+" 0 1,0 "+(textRadius)+",0"
					}/>
					<text y={fontsizeDay} fontSize={(fontsizeDay*1.4) + 'px'} style={{fill: this.state.colorScheme["text"]}}>
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
