// map is more effective than array in performance
const HINTS_MAP = () => new Map([
    ["1", "1"],
    ["2", "2"],
    ["3", "3"],
    ["4", "4"],
    ["5", "5"],
    ["6", "6"],
    ["7", "7"],
    ["8", "8"],
    ["9", "9"],
]);

export default class Cell {
    constructor(grid) {
        this.grid = grid;
        this.hintsMap = HINTS_MAP();
    }

    setPosition({row, col, segment}) {
        if (row) this.row = row;
        if (col) this.col = col;
        if (segment) this.segment = segment;
    }

    setSolution(solution) {
        this.solution = solution;
        this.hintsMap.clear();
        this._removeCombinationHints(solution);
    }

    removeHint(solution) {
        if (!this.solution) {
            this.hintsMap.delete(solution);
            this._solveFromLastHint();
        }
    }

    _removeCombinationHints(solution) {
        this.row.removeHintFromCells(solution);
        this.col.removeHintFromCells(solution);
        this.segment.removeHintFromCells(solution);
    }

    _solveFromLastHint() {
        if (this.hintsMap.size === 1) {
            let lastHint = this.hintsMap.keys().next().value;
            this.setSolution(lastHint);
        }
    }
}
