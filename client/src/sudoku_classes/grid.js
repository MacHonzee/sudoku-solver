import Cell from "./cell";
import Row from "./row";
import Col from "./col";
import Segment from "./segment";
import Constants from "./constants";

const SEGMENT_INDEXES = "000111222000111222000111222333444555333444555333444555666777888666777888666777888";

function nTimesMap(n, callback) {
    let array = [];
    for (let i = 0; i <= n; i++) {
        let result = callback(i);
        array.push(result);
    }
    return array;
}

export default class Grid {
    constructor(initialPattern) {
        this.prepareCells(initialPattern);
    }

    prepareCells(initialPattern) {
        this.cells = [];
        this.rows = nTimesMap(9, (i) => new Row(i));
        this.cols = nTimesMap(9, (i) => new Col(i));
        this.segments = nTimesMap(9, () => new Segment());

        let chars = initialPattern.split("");
        chars.forEach((char, i) => {
            let cell = new Cell(this);
            this.cells.push(cell);

            // every ninth character is a different row
            let rowIndex = Math.floor(i / 9);
            this.rows[rowIndex].addCell(cell);

            // every modulo is a different column
            let colIndex = i % 9;
            this.cols[colIndex].addCell(cell);

            // every third character of a row in a third column is a different segment
            // TODO think of a more mathematical way for this
            let segmentIndex = parseInt(SEGMENT_INDEXES[i]);
            this.segments[segmentIndex].addCell(cell);
        });

        chars.forEach((char, i) => {
            let cell = this.cells[i];
            if (char !== Constants.noSolution) {
                cell.setSolution(char);
            }
        });
    }
}
