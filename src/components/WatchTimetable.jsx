import React, { Component } from "react";
import Event from './Event.jsx'
import styled from "styled-components";

const CircularBody = styled.div`
	border: 1px solid black;
	border-radius: 50%;

	width: 358px;
	height: 358px; /* -2 px due to the border */
`;

class WatchTimetable extends Component {
	constructor(props) {
		super(props);
		this.state = {}
	}

	render() {
		return (
			<CircularBody>
				<Event start="15" end="6" color="blue" size="5" padding="5" background="white" />
				<Event start="6" end="15" color="red" size="5" padding="5" background="white" />
				{/*
				<Event start="12" end="16" color="green" size="30" padding="5" background="white" />
				<Event start="17" end="21" color="orange" size="30" padding="5" background="white" />*/}
			</CircularBody>
		);
	}
}

export default WatchTimetable;
