import spriteAPI from "../assets/sprites/api.png";
import spriteData from "../assets/sprites/data.png";
import spriteEntry from "../assets/sprites/entry.png";
import spriteExit from "../assets/sprites/exit.png";
import spriteFolder from "../assets/sprites/folder.png";
import spriteServer from "../assets/sprites/server.png";
import {NodeType} from "./LevelData";

export default class NodeTypeSprite {
    static getSprite(type: NodeType): string {
        switch (type) {
            case NodeType.API:
                return spriteAPI;
            case NodeType.DATA:
                return spriteData;
            case NodeType.ENTRY:
                return spriteEntry;
            case NodeType.EXIT:
                return spriteExit;
            case NodeType.FOLDER:
                return spriteFolder;
            case NodeType.SERVER:
                return spriteServer;
        }
    }
}