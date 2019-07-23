export enum ItemType {
    STOP,
    NUKE
}

export default class Item {
    type: ItemType;
    count: number;

    constructor(type: ItemType, count: number = 0) {
        this.type = type;
        this.count = count;
    }

    getIcon(): string {
        switch (this.type) {
            case ItemType.NUKE:
                return "fas fa-radiation";
            case ItemType.STOP:
                return "fas fa-hand-paper";
        }
    }

    useItem(): void {
        if (this.count > 0) {
            this.count--;
        }
    }

    static getDefaults(): Item[] {
        return [
            new Item(ItemType.STOP, 5),
            new Item(ItemType.NUKE, 5)
        ];
    }
}
