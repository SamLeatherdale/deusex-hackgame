import React from 'react';
import LevelComponent from "./LevelComponent";
import LevelData from "../types/LevelData";


import level1 from "../assets/levels/1.json";
import level2 from "../assets/levels/2.json";

export default class App extends React.Component {
    render() {
        return (
            <div className="App">
                <LevelComponent levelData={level2 as LevelData}/>
            </div>
        );
    }
}
