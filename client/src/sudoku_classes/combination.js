export default class Combination {
    constructor() {
        this.cells = []
    }

    removeHintFromCells(solution) {
        this.cells.forEach(cell => cell.removeHint(solution));
    }
}
