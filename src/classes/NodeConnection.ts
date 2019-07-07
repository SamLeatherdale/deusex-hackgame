import LevelNode from "./LevelNode";
import {CSSProperties} from "react";
import {PointObj} from "../types/LevelData";
import {genericCompare} from "../types/shared";



class OffsetContainer {
    from: PointObj;
    to: PointObj;

    constructor(from: PointObj, to: PointObj) {
        this.from = from;
        this.to = to;
    }

    orderByColumn(): PointObj[] {
        const points = [this.from, this.to];
        points.sort((a, b) => genericCompare(a.x, b.x));
        return points;
    }

    orderByRow(): PointObj[] {
        const points = [this.from, this.to];
        points.sort((a, b) => genericCompare(a.y, b.y));
        return points;
    }
}

export default class NodeConnection {
    from: LevelNode;
    to: LevelNode;
    bi: boolean;

    constructor(from: LevelNode, to: LevelNode, bi: boolean) {

        this.from = from;
        this.to = to;
        this.bi = bi;
    }

    /**
     * Determines whether the given node is at the start of this connection.
     * @param node
     */
    startsWith(node: LevelNode): boolean {
        return this.bi || node.equals(this.from);
    }

    /**
     * Determines whether the given node is at the end of this connection.
     * @param node
     */
    endsWith(node: LevelNode): boolean {
        return this.bi || node.equals(this.to);
    }

    getOtherNode(node: LevelNode): LevelNode {
        if (this.from.equals(node)) {
            return this.to;
        } else if (this.to.equals(node)) {
            return this.from;
        } else {
            throw new Error(`The node ${node.key} is not present in connection ${this.from.key} -> ${this.to.key}`);
        }
    }

    isConnectedToDisabled(): boolean {
        return (this.from.isDisabled() || this.to.isDisabled());
    }

    // getLength() {
    //     return Math.sqrt(
    //         Math.pow((this.x2 - this.x1), 2) + Math.pow((this.y2 - this.y1), 2)
    //     );
    // }

    calculateOffset(width: number, height: number): OffsetContainer {
        const {from, to} = this;
        const linegap = 1;

        let fromOffset: PointObj = {x: 0, y: 0};
        let toOffset: PointObj = {x: 0, y: 0};

        //To above From
        if (to.row < from.row && to.col === from.col) {
            fromOffset = {x: width / 2 - linegap, y: 0};
            toOffset = {x: width / 2 - linegap, y: height};
        }

        //To top-right of From
        else if (to.row < from.row && to.col > from.col) {
            fromOffset = {x: width - linegap, y: 0};
            toOffset = {x: 0, y: height - linegap};
        }

        //To right of From
        else if (to.row === from.row && to.col > from.col) {
            fromOffset = {x: width, y: height / 2 - linegap};
            toOffset = {x: 0, y: height / 2 - linegap};
        }

        //To bottom-right of From
        else if (to.row > from.row && to.col > from.col) {
            fromOffset = {x: width, y: height - linegap};
            toOffset = {x: linegap, y: 0};
        }

        //To below From
        else if (to.row > from.row && to.col === from.col) {
            fromOffset = {x: width / 2 + linegap, y: height};
            toOffset = {x: width / 2 + linegap, y: 0};
        }

        //To bottom-left of From
        else if (to.row > from.row && to.col < from.col) {
            fromOffset = {x: linegap, y: height};
            toOffset = {x: width, y: linegap};
        }

        //To left of From
        else if (to.row === from.row && to.col < from.col) {
            fromOffset = {x: 0, y: height / 2 + linegap};
            toOffset = {x: width, y: height / 2 + linegap};
        }

        //To top-left of From
        else if (to.row < from.row && to.col < from.col) {
            fromOffset = {x: 0, y: linegap};
            toOffset = {x: width - linegap, y: height};
        }

        return new OffsetContainer(fromOffset, toOffset);
    }

    /**
     * Adapted from https://stackoverflow.com/questions/19382872/how-to-connect-html-divs-with-lines
     * @param width
     * @param height
     */
    calculateStyles(width: number, height: number): CSSProperties {
        const props: CSSProperties = {};
        const offsets = this.calculateOffset(width, height);
        const widthAdjust = width / 4;
        const heightAdjust = height / 4;

        //Add block's position to offsets
        offsets.from.y += this.from.y * height;
        offsets.to.y += this.to.y * height;
        offsets.from.x += this.from.x * width;
        offsets.to.x += this.to.x * width;

        //Apply adjustment
        if (this.from.row !== this.to.row) {
            offsets.orderByRow().forEach((point, i) => {
                point.y += heightAdjust * (i === 0 ? -1 : 1);
            });
        }

        if (this.from.col !== this.to.col) {
            offsets.orderByColumn().forEach((point, i) => {
                point.x += widthAdjust * (i === 0 ? -1 : 1);
            });
        }

        // var fT = from.offsetTop  + from.offsetHeight/2;
        // var tT = to.offsetTop    + to.offsetHeight/2;
        // var fL = from.offsetLeft + from.offsetWidth/2;
        // var tL = to.offsetLeft   + to.offsetWidth/2;
        const fT = offsets.from.y;
        const tT = offsets.to.y;
        const fL = offsets.from.x;
        const tL = offsets.to.x;
        let top, left;

        var CA   = Math.abs(tT - fT);
        var CO   = Math.abs(tL - fL);
        var H    = Math.sqrt(CA*CA + CO*CO);
        var ANG  = 180 / Math.PI * Math.acos( CA/H );

        if(tT > fT){
            top  = (tT-fT)/2 + fT;
        }else{
            top  = (fT-tT)/2 + tT;
        }
        if(tL > fL){
            left = (tL-fL)/2 + fL;
        }else{
            left = (fL-tL)/2 + tL;
        }

        if(( fT < tT && fL < tL) || ( tT < fT && tL < fL) || (fT > tT && fL > tL) || (tT > fT && tL > fL)){
            ANG *= -1;
        }
        top-= H/2;

        props.transform = 'rotate('+ ANG +'deg)';
        props.top    = top+'px';
        props.left   = left+'px';
        props.height = H + 'px';
        return props;
    }
}
