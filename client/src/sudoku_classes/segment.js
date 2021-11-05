import Combination from "./combination";

export default class Segment extends Combination {
    addCell(cell) {
        this.cells.push(cell);
        cell.setPosition({segment: this});
    }
}

