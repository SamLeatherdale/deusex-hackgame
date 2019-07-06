import React from 'react';
import LevelComponent from "./LevelComponent";
import level1 from "../assets/levels/1.json";
import LevelData from "../types/LevelData";

export default class App extends React.Component {
    render() {
        return (
            <div className="App">
                <LevelComponent levelData={level1 as LevelData}/>
            </div>
        );
    }
}