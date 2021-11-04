import Cell from "./cell";
import Row from "./row";
import Col from "./col";
import Segment from "./segment";

const SEGMENT_INDEXES = "000111222000111222000111222333444555333444555333444555666777888666777888666777888";

export default class Grid {
    constructor(initialPattern) {
        this.prepareCells(initialPattern);
    }

    prepareCells(initialPattern) {
        let chars = initialPattern.split("");

        let rows = [
            [], [], [], [], [], [], [], [], []
        ];
        let cols = [
            [], [], [], [], [], [], [], [], []
        ];
        let segments = [
            [], [], [], [], [], [], [], [], []
        ];

        this.cells = [];
        chars.forEach((char, i) => {
            let cell = new Cell(char);
            this.cells.push(cell);

            // every ninth character is a different row
            let rowIndex = Math.floor(i / 9);
            rows[rowIndex].push(cell);

            // every modulo is a different column
            let colIndex = i % 9;
            cols[colIndex].push(cell);

            // every third character is a different segment
            // TODO think of a more mathematical way for this
            let segmentIndex = parseInt(SEGMENT_INDEXES[i]);
            segments[segmentIndex].push(cell);
        });

        this.rows = rows.map(rowCells => new Row(rowCells));
        this.cols = cols.map(colCells => new Col(colCells));
        this.segments = segments.map(segmentCells => new Segment(segmentCells));
    }
}
