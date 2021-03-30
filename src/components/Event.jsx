import React, { Component } from "react";

const watchSize = 360;

// A function to blend colours
// this was needed because my watch had trouble rendering the css property filer: brightness(50%)
// so I modified the hex value of the colour myself.
// This function comes from https://stackoverflow.com/a/13532993
// Thanks Pablo, et al.
// Yeah I'd use the one from the top answer, it looks really sick,
// but React doesn't like it, so I had to use this.
// It works alright I guess ...
function shadeColor(color, percent) {
	var R = parseInt(color.substring(1,3),16);
	var G = parseInt(color.substring(3,5),16);
	var B = parseInt(color.substring(5,7),16);
	R = parseInt(R * (100 + percent) / 100);
	G = parseInt(G * (100 + percent) / 100);
	B = parseInt(B * (100 + percent) / 100);
	R = (R<255)?R:255;
	G = (G<255)?G:255;
	B = (B<255)?B:255;
	var RR = ((R.toString(16).length===1)?"0"+R.toString(16):R.toString(16));
	var GG = ((G.toString(16).length===1)?"0"+G.toString(16):G.toString(16));
	var BB = ((B.toString(16).length===1)?"0"+B.toString(16):B.toString(16));
	return "#"+RR+GG+BB;
}

class Event extends Component {
	constructor(props) {
		super(props);
		this.state = {
			start: this.props.start,
			end: this.props.end,
			text: this.props.text,
			fontSize: this.props.fontSize,
			color: this.props.color,
			textColor: this.props.textColor,
			outline: this.props.outline || "",
			size: this.props.size,
			outerMargin: this.props.outerMargin,
			padding: this.props.padding,
			backgound: this.props.background,
			dim: this.props.dim,
			id: this.props.id || Math.floor(Math.random() * 100000)
		}

		this.hourToAngle = this.hourToAngle.bind(this);
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
		radius.center = watchSize/2 - this.state.outerMargin - this.state.padding - this.state.size/2;
		radius.outer = radius.center + this.state.size/2;
		radius.inner = radius.center - this.state.size/2;

		let r = watchSize/2 - this.state.outerMargin - this.state.size/2;
		let angleOffset = Math.atan((this.state.size/2) / r);
		angle.start += angleOffset;
		angle.end -= angleOffset;

		let edges = {};
		["start", "end"].forEach((startend) => {
			edges[startend] = {};
			["outer", "inner", "center"].forEach((outincenter) => {
				edges[startend][outincenter] = {}
				edges[startend][outincenter].x = Math.round(Math.cos(angle[startend]) * radius[outincenter] + watchSize/2);
				edges[startend][outincenter].y = Math.round(Math.sin(angle[startend]) * radius[outincenter] + watchSize/2);
			})
		})

		let isLarge = Math.abs(this.state.start - this.state.end) > 6
		let size = isLarge? "1" : "0";

		let svgString =
			// move to starting position (outer start)
			" M "+edges.start.outer.x+" "+edges.start.outer.y+
			// draw arc around start egde
			" A "+(this.state.size/2)+" "+(this.state.size/2)+" 0 0 0 "+edges.start.inner.x+" "+edges.start.inner.y+
			// draw inner arc
			" A "+radius.inner+" "+radius.inner+" 0 "+size+" 1 "+edges.end.inner.x+" "+edges.end.inner.y+
			// draw arc around end edge
			" A "+(this.state.size/2)+" "+(this.state.size/2)+" 0 0 0 "+edges.end.outer.x+" "+edges.end.outer.y+
			// draw outer arc
			" A "+radius.outer+" "+radius.outer+" 0 "+size+" 0 "+edges.start.outer.x+" "+edges.start.outer.y
		// A rx, ry, angle, large/small arc, sweep, dx, dy


		return (
			<svg viewBox={"0 0 "+watchSize+" "+watchSize} style={{
				position: "absolute",
				top:"0",
				left: "0",
				width: watchSize+'px',
				height: watchSize+'px'
			}}>
				<path
					id={"curve_"+this.state.id}
					stroke={this.state.outline}
					fill={this.state.dim? shadeColor(this.state.color, -50) : this.state.color}
					d={svgString}
				/>
				<text y={ (-(this.state.size - this.state.fontSize)/2)+"" } fontSize={(this.state.fontSize*1.4) + 'px'} style={{fill: this.state.textColor}}>
					<textPath xlinkHref={"#curve_"+this.state.id} textAnchor="middle" startOffset="25%">
						{this.state.text}
					</textPath>
				</text>
			</svg>
		);
	}
}

export default Event;
