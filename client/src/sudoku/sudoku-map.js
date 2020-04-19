import React, {useState} from 'react';
import "./sudoku-map.css";

function SudokuMap(props) {
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

    function checkNumberInHints(cellA, checkedValue) {
        let hintIndex = cellA.hints.indexOf(checkedValue);
        if (hintIndex > -1) {
            cellA.hints.splice(hintIndex, 1);
        }
    }

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
