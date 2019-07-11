// import spriteAPI from "../../public/assets/sprites/api.png";
// import spriteData from "../../public/assets/sprites/data.png";
// import spriteEntry from "../../public/assets/sprites/entry.png";
// import spriteExit from "../../public/assets/sprites/exit.png";
// import spriteFolder from "../../public/assets/sprites/folder.png";
// import spriteServer from "../../public/assets/sprites/server.png";
import {NodeType} from "./LevelData";

export default class NodeTypeSprite {
    static getSprite(type: NodeType): string {
        // switch (type) {
        //     case NodeType.API:
        //         return spriteAPI;
        //     case NodeType.DATA:
        //         return spriteData;
        //     case NodeType.ENTRY:
        //         return spriteEntry;
        //     case NodeType.EXIT:
        //         return spriteExit;
        //     case NodeType.FOLDER:
        //         return spriteFolder;
        //     case NodeType.SERVER:
        //         return spriteServer;
        // }
        return `assets/sprites/${type}.png`
    }
}