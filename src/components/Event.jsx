import React, { Component } from "react";

class Event extends Component {
	constructor(props) {
		super(props);
		this.state = {
			start: this.props.start,
			end: this.props.end,
			color: this.props.color,
			size: this.props.size,
			padding: this.props.padding,
			backgound: this.props.background
		}

		this.hourToAngle = this.hourToAngle.bind(this);
		this.getCoord = this.getCoord.bind(this);
		this.getXCoord = this.getXCoord.bind(this);
		this.getYCoord = this.getYCoord.bind(this);
	}

	getXCoord(angle) {
		return this.getCoord(angle, Math.cos);
	}
	getYCoord(angle) {
		return this.getCoord(angle, Math.sin);
	}
	getCoord(angle, funct) {
		// assuming watch screen dimensions of 360x360
		let r = (360/2) - (this.state.size/2) - this.state.padding
		let coord = funct(angle)*r + 360/2
		coord -= this.state.size/2; // translate to center of circle
		return coord;
	}

	hourToAngle(hour) {
		let angle = (hour % 12) * (2*Math.PI/12)
		angle -= Math.PI/2 // hour 0 is upward (angle 0), not forward
		return angle;
	}

	render() {
		// The following section is very hacky, enter at own discretion

		// For each "quadrant" of the circle, we have a circle absolutely
		// positioned at the screen's center with "overflow: hidden".
		// This masks anything going outside the circular boundaries.
		// Then, a rectangle is absolutely positioned at the
		// screen's center, and skewed so that it only covers a portion of a circle,
		// similar to a pie chart.
		// Lastly, another "mask" is applied (a circular div at the screen's center)
		// with the same colour as the background, to transform the pie chart into
		// an arc.
		// Two small circles are also added on the edges for a rounded effect.

		let startAngle = this.hourToAngle(this.state.start);
		let endAngle = this.hourToAngle(this.state.end);

		let radius = 360 - this.state.padding - this.state.size/2
		let angleOffset = Math.atan(this.state.size / radius);
		//console.log("angleoffset",angleOffset);

		startAngle += angleOffset;
		endAngle -= angleOffset;

		let edges = [startAngle, endAngle];

		let skews = []; // 90 = no arc. 0 = full arc
		let rotations = []; // offset the beginning of the quadrant

		while (endAngle < startAngle) endAngle += 2*Math.PI;

		let currentAngle = startAngle;
		while (true) {
			rotations.push(Math.floor(currentAngle * 360/(2*Math.PI)));
			let diff = endAngle - currentAngle;
			if (diff > Math.PI/2) {
				skews.push(0);
				currentAngle += Math.PI/2;
				continue;
			}
			skews.push(Math.floor(((Math.PI/2)-diff) * 360/(2*Math.PI)));
			break;
		}
		//console.log("skews", skews, "rotations", rotations)

		return (
			<>
			{rotations.map((rotation,i) => {
				{/* first, a wrapper div that functions as the outer circular mask */}
				return <>
					<div key={2*i} style={{
						width: (360 - 2*this.state.padding) + 'px',
						height: (360 - 2*this.state.padding) + 'px',
						borderRadius: "50%",
						//backgroundColor: "blue",
						position: "fixed",
						top: (this.state.padding) + 'px',
						left: (this.state.padding) + 'px',
						overflow: "hidden",
					}}>
						{/* then, the inner rectangle, skewed to only fill the required segment */}
						<div style={{
							transform: "rotate("+(rotation)+"deg) skew("+skews[i]+"deg)",
							width: 360 + 'px',
							height: 360 + 'px',
							backgroundColor: this.state.color,
							position: "absolute",
							top: (360/2 - this.state.padding) + 'px',
							left: (360/2 - this.state.padding) + 'px',
							transformOrigin: "0 0"
						}}>
						</div>
					</div>
					{/* lastly, an inner circle */}
					<div key={2*i+1} style={{
						width: (360 - 2*this.state.padding - 2*this.state.size) + 'px',
						height: (360 - 2*this.state.padding - 2*this.state.size) + 'px',
						backgroundColor: this.state.backgound,
						position: "absolute",
						top: (parseInt(this.state.padding) + parseInt(this.state.size)) + 'px',
						left: (parseInt(this.state.padding) + parseInt(this.state.size)) + 'px',
						borderRadius: "50%"
					}}></div>
				</>
			})}

			{/* dots on the edges for a rounded effect */}
			{edges.map((angle,i) => {
				return <div key={i} style={{
					borderRadius: "50%",
					backgroundColor: this.state.color,
					width: this.state.size + 'px',
					height: this.state.size + 'px',
					position: "absolute",
					top: this.getYCoord(angle) + 'px',
					left: this.getXCoord(angle) + 'px'
				}}/>
			})}
			</>
		);
	}
}

export default Event;
