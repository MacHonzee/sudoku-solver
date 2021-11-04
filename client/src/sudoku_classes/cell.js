export default class Cell {
    constructor(solution) {
        this.row = undefined;
        this.col = undefined;
        this.segment = undefined;

        this.hints = "123456789";
        if (solution !== "0") {
            this.solution = solution;
            this.removeHint(solution);
        }
    }

    removeHint(hint) {
        this.hints = hint.substr(0, hint) + "0" + hint.substr(hint + 1);
    }
}
