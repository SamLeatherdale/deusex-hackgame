type callback = () => void;

export default class DelayableTimer {
    static timers: Map<number, DelayableTimer> = new Map();
    static uid = 0;

    readonly id: number;
    readonly promise: Promise<callback>;
    readonly initialTimeout: number;

    private tags: string[] = [];
    private resolve: callback;
    private reject: callback;
    private completed = false;
    private handle = -1;

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
        const timers = this.getTimers(tags);
        timers.forEach(timer => timer.reschedule(timeout));
    }

    static cancelTimers(tags?: string) {
        const timers = this.getTimers(tags);
        timers.forEach(timer => timer.cancel());
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

        this.handle = window.setTimeout(() => {
            this.completed = true;
            DelayableTimer.timers.delete(this.id);
            this.resolve();
        }, timeout); //Call resolve when done
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
