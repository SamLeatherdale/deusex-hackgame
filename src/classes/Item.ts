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

    static getDefaults(): Item[] {
        return [
            new Item(ItemType.STOP),
            new Item(ItemType.NUKE)
        ];
    }
}
