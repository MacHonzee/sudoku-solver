import React, {useState} from 'react';
import "./sudoku-map.css";

function SudokuMap(props) {

    // FIXME this needs refactorization, we need to prepare some better optimized structures
    // hints should be sorted array of all items with null where there is no number
    // also we need hintsLeft property
    function prepareSolutionFromMap() {
        let chars = props.map.split("");
        let rows = [];
        let row = [];
        chars.forEach((char, i) => {
           let num = parseInt(char);
           row.push({
               value: num,
               solution: null,
               hints: num ? [] : [1, 2, 3, 4, 5, 6, 7, 8, 9]
           });

            if ((i + 1) % 9 === 0) {
                rows.push(row);
                let newRow = [];
                row = [...newRow];
            }
        });
        return rows;
    }

    const [solution, setSolution] = useState(prepareSolutionFromMap());
    const [showHints, setShowHints] = useState(true);

    function renderMap() {
        return solution.map((row, i1) => {
            let cells = row.map((cell, i2) => {
                if (showHints && !cell.value && !cell.solution) {
                    return (
                        <div className={"sudoku-map-cell sudoku-map-cell-hints"} key={i2}>
                            <div>{cell.hints.join(" ")}</div>
                        </div>
                    )
                } else {
                    let extraClass = cell.solution ? " sudoku-map-cell-solved" : ""
                    return (
                        <div className={"sudoku-map-cell" + extraClass} key={i2}>
                            {cell.value || cell.solution}
                        </div>
                    )
                }
            });

            return (
                <div className={"sudoku-map-row"} key={i1}>
                    {cells}
                </div>
            );
        })
    }

    // FIXME optimize this after refactoring solution, array[index] is better than array.indexOf(value)
    function checkNumberInHints(cellA, checkedValue) {
        let hintIndex = cellA.hints.indexOf(checkedValue);
        if (hintIndex > -1) {
            cellA.hints.splice(hintIndex, 1);
        }
    }

    // FIXME optimize - this is O(mn^2), it can be O(2mn) at least
    function checkSameNumberInRow() {
        for (let row of solution) {
            for (let cellA of row) {
                if (cellA.value || cellA.solution) {
                    continue;
                }

                for (let cellB of row) {
                    let checkedValue = cellB.value || cellB.solution;
                    if (!checkedValue) continue;
                    checkNumberInHints(cellA, checkedValue);
                }
            }
        }
    }

    // FIXME optimize - this is O(mn^2), it can be O(2mn) at least
    function checkSameNumberInColumn() {
        for (let rowA of solution) {
            for (let cellIndex = 0; cellIndex < rowA.length; cellIndex++) {
                let cellA = rowA[cellIndex];
                if (cellA.value || cellA.solution) {
                    continue;
                }

                for (let rowB of solution) {
                    let cellB = rowB[cellIndex];
                    let checkedValue = cellB.value || cellB.solution;
                    if (!checkedValue) continue;
                    checkNumberInHints(cellA, checkedValue);
                }
            }
        }
    }

    function forEachCellInSegment(rowI, colI, callback) {
        for (let cellRowI = 0; cellRowI <= 2; cellRowI++) {
            for (let cellColI = 0; cellColI <= 2; cellColI++) {
                let finalColI = (colI * 3) + cellColI;
                let finalRowI = (rowI * 3) + cellRowI;
                let cell = solution[finalRowI][finalColI];
                callback(cell);
            }
        }
    }

    function check3to3segments() {
        for (let rowSegmentI = 0; rowSegmentI <= 2; rowSegmentI++) {
            for (let colSegmentI = 0; colSegmentI <= 2; colSegmentI++) {
                forEachCellInSegment(rowSegmentI, colSegmentI, cellA => {
                    if (cellA.value || cellA.solution) {
                        return;
                    }

                    forEachCellInSegment(rowSegmentI, colSegmentI, cellB => {
                        let checkedValue = cellB.value || cellB.solution;
                        if (!checkedValue) return;
                        checkNumberInHints(cellA, checkedValue);
                    })
                })
            }
        }
    }

    function fillSolutions(all) {
        for (let row of solution) {
            for (let cell of row) {
                if (!cell.value && !cell.solution && cell.hints.length === 1) {
                    cell.solution = cell.hints[0];
                    cell.hints = [];
                    if (!all) return;
                }
            }
        }
    }

    // handlers
    function handleSolveAll() {
        checkSameNumberInRow();
        checkSameNumberInColumn();
        check3to3segments();
        fillSolutions(true);
        setSolution([...solution]);
    }

    function handleCheckSameNumberInRow() {
        checkSameNumberInRow();
        setSolution([...solution]);
    }

    function handleCheckSameNumberInColumn() {
        checkSameNumberInColumn();
        setSolution([...solution]);
    }

    function handleCheck3to3segments() {
        check3to3segments();
        setSolution([...solution]);
    }

    function handleFillOneNumber() {
        fillSolutions(false);
        setSolution([...solution]);
    }

    return (
        <div className={"sudoku-map-wrapper"}>
            <div>
                <button onClick={() => setShowHints(!showHints)}>
                    {showHints ? "Hide hints" : "Show hints"}
                </button>

                <button onClick={handleSolveAll}>
                    Solve next step
                </button>
            </div>

            <div>
                <button onClick={handleCheckSameNumberInRow}>
                    Solve numbers in rows
                </button>

                <button onClick={handleCheckSameNumberInColumn}>
                    Solve numbers in columns
                </button>

                <button onClick={handleCheck3to3segments}>
                    Solve numbers in 3x3 segments
                </button>

                <button onClick={handleFillOneNumber}>
                    Fill one number
                </button>
            </div>

            <div className={"sudoku-map"}>
                {renderMap()}
            </div>
        </div>
    );
}

export default SudokuMap;
