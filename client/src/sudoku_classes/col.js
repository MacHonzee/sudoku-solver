import Combination from "./combination";

export default class Col extends Combination {
    constructor(index) {
        super();
        this.index = index;
    }

    addCell(cell) {
        this.cells.push(cell);
        cell.setPosition({col: this});
    }
}
