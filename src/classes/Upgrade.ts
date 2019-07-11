export class UpgradeProps {
    title: string;
    description: string;
    levelDescriptions: string[];
    maxLevel: number;
    currentLevel?: number;
    type: UpgradeType;
}

export enum UpgradeType {
    CAPTURE = "capture",
    FORTIFY = "fortify",
    STEALTH = "stealth",
    ANALYZE = "analyze"
}

export default class Upgrade extends UpgradeProps {
    currentLevel: number;

    constructor(props: UpgradeProps) {
        super();
        this.currentLevel = 1;
        Object.assign(this, props);
    }

    getLevelDescription(level: number) {
        return this.levelDescriptions[level - 1];
    }
}