import {TypedObj} from "../shared";
import LevelData from "./LevelData";

const cache: TypedObj<LevelData> = {};

function importAll (r) {
    r.keys().forEach(key => cache[key] = r(key));
}
const levels = require.context('../assets/levels', true, /(?<!schema)\.json$/);
importAll(levels);

export default cache;