import Combination from "./combination";

export default class Row extends Combination {
    constructor(index) {
        super();
        this.index = index;
    }

    addCell(cell) {
        this.cells.push(cell);
        cell.setPosition({row: this});
    }
}
