import React from "react"
import * as autoBind from "auto-bind";

export interface TimerComponentProps {
    time: number; //Time in ms
    interval?: number; //Interval in ms
    onTimeOut?: () => void;
    paused?: boolean;
}

export class TimerComponentState {
    timeLeft: number; //Time in ms
    paused: boolean;
    pauseIntervals: PauseInterval[] = [];

    constructor(props: TimerComponentProps) {
        this.timeLeft = props.time;
        this.paused = props.paused;
    }
}

class PauseInterval {
    private readonly startTime: number = 0;
    private stopTime: number = 0;

    constructor() {
        this.startTime = new Date().getTime();
    }
    stop() {
        this.stopTime = new Date().getTime();
    }
    isComplete() {
        return this.stopTime > 0;
    }
    getInterval(): number {
        return this.stopTime - this.startTime;
    }
}

export default abstract class TimerComponent<
        P extends TimerComponentProps,
        S extends TimerComponentState>
    extends React.Component<P, S> {

    initialTimeout: number;
    startTimestamp: number;
    tickHandle: number;

    static readonly defaultProps = {
        interval: 10,
        onTimeOut: () => '',
        paused: false
    };

    static getDerivedStateFromProps(nextProps: TimerComponentProps, prevState: TimerComponentState): Partial<TimerComponentState> {
        if (nextProps.paused !== prevState.paused) {
            const pauseIntervals = prevState.pauseIntervals.slice();
            if (nextProps.paused) {
                pauseIntervals.push(new PauseInterval());
            } else if (pauseIntervals.length) {
                const interval = pauseIntervals[pauseIntervals.length - 1];
                interval.stop();
            }

            return {
                pauseIntervals: pauseIntervals,
                paused: nextProps.paused
            }
        }
        return null;
    }


    protected constructor(props: P) {
        super(props);

        this.initialTimeout = props.time;
        this.startTimestamp = new Date().getTime();

        // @ts-ignore
        this.state = new TimerComponentState(props);
        autoBind.react(this);
    }

    componentDidMount(): void {
        this.tickHandle = window.setInterval(this.intervalHandler, this.props.interval);
    }

    componentWillUnmount(): void {
        this.unregisterInterval();
    }

    unregisterInterval() {
        if (typeof this.tickHandle !== "undefined") {
            clearInterval(this.tickHandle);
        }
        this.tickHandle = undefined;
    }

    getTimeLeft(): number {
        const elapsed = this.getElapsedTime();
        return this.props.time - elapsed;
    }

    getElapsedTime(): number {

        const now = new Date().getTime();
        const realElapsed = now - this.startTimestamp;

        //Subtract any pauses from the elapsed
        const pauseTime = this.state.pauseIntervals.filter(p => p.isComplete()).map(p => p.getInterval()).reduce((sum, t) => sum + t, 0);
        return realElapsed - pauseTime;
    }

    intervalHandler() {
        if (this.props.paused) {
            return;
        }

        let done = false;

        this.setState((prevState) => {
            let newTime = this.getTimeLeft();
            if (newTime <= 0) {
                newTime = 0;
                done = true;
            }
            return {timeLeft: newTime};
        }, () => {
            this.tick();

            if (done) {
                this.unregisterInterval();
                this.props.onTimeOut();
            }
        });
    }

    tick() {

    }
}