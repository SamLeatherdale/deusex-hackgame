type callback = () => void;

export default class DelayableTimer {
    private static timers: Map<number, DelayableTimer> = new Map();
    private static uid = 0;

    private readonly id: number;
    private readonly initialTimeout: number;
    private readonly tags: string[] = [];

    readonly promise: Promise<callback>;
    private resolve: callback;
    private reject: callback;

    private completed = false;
    private handle = -1;
    private scheduledComplete: number;

    constructor(timeout: number, ...tags: string[]) {
        this.id = DelayableTimer.uid++;
        this.initialTimeout = timeout;
        this.tags = tags;

        this.promise = new Promise((resolve, reject) => {
            //Set up initial schedule
            this.resolve = resolve;
            this.reject = reject;
            this.reschedule();
        });

        DelayableTimer.timers.set(this.id, this);
    }

    static getTimers(tags?: string): DelayableTimer[] {
        const timers = Array.from(this.timers.values());
        if (typeof tags === "undefined") {
            return timers;
        }
        return timers.filter(timer => timer.tags.includes(tags));
    }

    static rescheduleTimers(tags?: string, timeout?: number) {
        this.getTimers(tags).forEach(timer => timer.reschedule(timeout));
    }

    static delayTimers(tags: string, timeout: number) {
        this.getTimers(tags).forEach(timer => timer.delay(timeout));
    }

    static cancelTimers(tags?: string) {
        this.getTimers(tags).forEach(timer => timer.cancel());
    }

    /**
     * Gets the time remaining on this timer.
     * Will be negative if the scheduled time has already passed.
     */
    getTimeRemaining(): number {
        const timestamp = new Date().getTime();
        return this.scheduledComplete - timestamp;
    }

    /**
     * Schedules or reschedules the timer.
     * @param timeout
     */
    reschedule(timeout?: number) {
        if (this.completed) {
            return;
        }
        if (this.handle > -1) {
            window.clearTimeout(this.handle);
        }

        timeout = typeof timeout === "number" ? timeout : this.initialTimeout;
        const timestamp = new Date().getTime();
        this.scheduledComplete = timestamp + timeout;

        this.handle = window.setTimeout(() => {
            this.completed = true;
            DelayableTimer.timers.delete(this.id);
            this.resolve();
        }, timeout); //Call resolve when done
    }

    /**
     * Delays the timer by the specified amount.
     */
    delay(time: number) {
        this.reschedule(this.getTimeRemaining() + time);
    }

    /**
     * Cancels the timer and calls the reject callback.
     */
    cancel() {
        if (this.completed) {
            return;
        }
        if (this.handle > -1) {
            window.clearTimeout(this.handle);
        }
        this.completed = true;
        this.reject();
    }
}
