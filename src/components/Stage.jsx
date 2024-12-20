import React, { useState, useRef, useEffect } from "react";
import endStageSoundSource from "../public/end-stage.mp3";
import clickButton from "../public/interface-button.mp3";
import "./Stage.css";

const Root = document.getElementById("root");

function Stage({
	getStageTime,
	currentStage,
	setCurrentStage,
	pomodoros,
	setPomodoros,
	autoStartFocus,
	autoStartBreaks,
	pomodorosUntilLongBreak,
}) {
	const [isRunning, setIsRunning] = useState(false);
	const [currentTime, setCurrentTime] = useState(getStageTime(currentStage));
	const interval = useRef(null);
	const endStageSound = new Audio(endStageSoundSource);
	const clickButtonSound = new Audio(clickButton);

	const StartBtn = useRef(null);

	let displayHours = Math.floor(currentTime / 3600);
	let displayMinutes = Math.floor(currentTime / 60) % 60;
	let displaySeconds = currentTime % 60;

	if (displayHours < 10) displayHours = "0" + displayHours;
	if (displayMinutes < 10) displayMinutes = "0" + displayMinutes;
	if (displaySeconds < 10) displaySeconds = "0" + displaySeconds;

	const displayTime =
		displayHours + ":" + displayMinutes + ":" + displaySeconds;

	const color_1 = { r: 225, g: 75, b: 75 }; // red
	const color_2 = { r: 50, g: 150, b: 200 }; // blue

	const [startColor, setStartColor] = useState(color_1);
	const [endColor, setEndColor] = useState(color_2);

	const interpolateColor = (progress) => {
		// Calculate the interpolated color values
		const r = Math.floor(
			startColor.r + (1 - progress) * (endColor.r - startColor.r)
		);
		const g = Math.floor(
			startColor.g + (1 - progress) * (endColor.g - startColor.g)
		);
		const b = Math.floor(
			startColor.b + (1 - progress) * (endColor.b - startColor.b)
		);

		return `rgb(${r}, ${g}, ${b})`;
	};

	useEffect(() => {
		if (StartBtn.current) {
			const rgbColor = interpolateColor(
				currentTime / getStageTime(currentStage)
			);
			const rgbaColor = rgbColor
				.replace("rgb", "rgba")
				.replace(")", ", 0.8)");
			StartBtn.current.style.color = rgbaColor;
		}
	});

	Root.style.backgroundColor = interpolateColor(
		currentTime / getStageTime(currentStage)
	);

	useEffect(() => {
		setCurrentTime(getStageTime(currentStage));
		if (currentStage == "Focus") {
			setTimeout(() => setIsRunning(autoStartFocus), 0);
			setStartColor(color_1);
			setEndColor(color_2);
		} else {
			setTimeout(() => setIsRunning(autoStartBreaks), 0);
			setStartColor(color_2);
			setEndColor(color_1);
		}
	}, [currentStage]);

	useEffect(() => {
		if (isRunning) {
			interval.current = setInterval(() => {
				setCurrentTime((prevTime) => {
					if (prevTime <= 1) {
						clearInterval(interval.current);
						setIsRunning(false);
						handleStageTransition();
						return 0;
					}

					return prevTime - 1;
				});
			}, 1000);
		} else {
			clearInterval(interval.current);
		}

		return () => clearInterval(interval.current);
	}, [isRunning]);

	const handleStageTransition = () => {
		endStageSound.play();

		let nextStage;

		switch (currentStage) {
			case "Focus":
				const newPomodoros = pomodoros + 1;
				setTimeout(() => setPomodoros(newPomodoros), 0);
				nextStage =
					newPomodoros % pomodorosUntilLongBreak == 0
						? "Long break"
						: "Break";
				break;
			case "Break":
				nextStage = "Focus";
				break;
			case "Long break":
				nextStage = "Focus";
				break;
			default:
				//console.error("Unknown stage:", currentStage);
				return;
		}

		nextStage == "Focus"
			? setTimeout(() => setIsRunning(autoStartFocus), 0)
			: setTimeout(() => setIsRunning(autoStartBreaks), 0);

		setTimeout(() => setCurrentStage(nextStage), 0);
		setTimeout(() => setCurrentTime(getStageTime(nextStage)), 0);
	};

	return (
		<>
			<h1 className="timer">{displayTime}</h1>
			<button
				className="start-btn"
				ref={StartBtn}
				onClick={() => {
					setIsRunning(!isRunning);
					clickButtonSound.play();
				}}
			>
				{isRunning ? "Stop" : "Start"}
			</button>
		</>
	);
}

export default Stage;
