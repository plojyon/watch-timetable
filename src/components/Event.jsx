import React, { Component } from "react";

class Event extends Component {
	constructor(props) {
		super(props);
		this.state = {
			start: this.props.start,
			end: this.props.end,
			text: this.props.text,
			color: this.props.color,
			outline: this.props.outline,
			size: this.props.size,
			outerMargin: this.props.outerMargin,
			padding: this.props.padding,
			backgound: this.props.background,
			dim: this.props.dim,
			id: this.props.key || Math.floor(Math.random() * 1000)
		}

		this.hourToAngle = this.hourToAngle.bind(this);
		//this.getCoord = this.getCoord.bind(this);
		//this.getXCoord = this.getXCoord.bind(this);
		//this.getYCoord = this.getYCoord.bind(this);
	}

	hourToAngle(hour) {
		let angle = (hour % 12) * (2*Math.PI/12)
		angle -= Math.PI/2 // hour 0 is upward (angle 0), not forward
		return angle;
	}

	render() {
		// angle at which the start/end hour is
		let angle = {
			start: this.hourToAngle(this.state.start),
			end: this.hourToAngle(this.state.end)
		}

		// distance from screen center to outer/center/inner of the curve
		let radius = {};
		radius.center = 360/2 - this.state.outerMargin - this.state.padding - this.state.size/2;
		radius.outer = radius.center + this.state.size/2;
		radius.inner = radius.center - this.state.size/2;

		let r = 360/2 - this.state.outerMargin - this.state.size/2;
		let angleOffset = Math.atan((this.state.size/2) / r);
		angle.start += angleOffset;
		angle.end -= angleOffset;

		let edges = {};
		["start", "end"].map((startend) => {
			edges[startend] = {};
			["outer", "inner", "center"].map((outincenter) => {
				edges[startend][outincenter] = {}
				edges[startend][outincenter].x = Math.round(Math.cos(angle[startend]) * radius[outincenter] + 360/2);
				edges[startend][outincenter].y = Math.round(Math.sin(angle[startend]) * radius[outincenter] + 360/2);
			})
		})

		let globalCenter = {x: 360/2, y: 360/2}

		let isLarge = Math.abs(this.state.start - this.state.end) > 6
		let size = isLarge? "1" : "0";

		let svgString = ""+
			// move to starting position (outer start)
			" M "+edges.start.outer.x+" "+edges.start.outer.y+
			// draw arc around start egde
			" A "+(this.state.size/2)+" "+(this.state.size/2)+" 0 0 0 "+edges.start.inner.x+" "+edges.start.inner.y+
			// draw inner arc
			" A "+radius.inner+" "+radius.inner+" "+" 0 "+size+" 1 "+edges.end.inner.x+" "+edges.end.inner.y+
			// draw arc around end edge
			" A "+(this.state.size/2)+" "+(this.state.size/2)+" 0 0 0 "+edges.end.outer.x+" "+edges.end.outer.y+
			// draw outer arc
			" A "+radius.outer+" "+radius.outer+" "+" 0 "+size+" 0 "+edges.start.outer.x+" "+edges.start.outer.y
		console.log(svgString);
		// rx, ry, angle, large/small arc, sweep, dx, dy

		return (
			<svg viewBox="0 0 360 360" style={{position: "absolute", top:"0", left: "0"}}>
				<path
					id={"curve_"+this.state.id}
					stroke={this.state.outline}
					fill={this.state.color}
					d={svgString}
					style={{filter: this.state.dim?"brightness(50%)":""}}
				/>
				<text width="500">
					<textPath xlinkHref={"#curve_"+this.state.id} textAnchor="middle" startOffset="25%">
						{this.state.text}
					</textPath>
				</text>
			</svg>
		);
	}
}

export default Event;
