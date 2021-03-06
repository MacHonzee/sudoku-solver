import React, {useState} from 'react';
import "./sudoku-map.css";

// návrh nových datových struktur
let struct = {
    // to, co přišlo z propsy (nuly tam, kde není známá hodnota předem)
    // bez počáteční trailing nuly, čili přesně 81 znaků
    initialValues: "400000078700100409002300000100406000060000000040053100000500000813000007000020000",
    // to, co bylo vyplněno automaticky (a nuly tam, kde nebylo vyplněno zatím nic nebo kde je initialValue)
    // rovněž přesně 81 znaků
    filledValues: "000000000000000000000000000000000000000000000000000000000000000000000000000000000",

    rows: {
        numbers: [
            // čili pole o 10 číslech, na nultém indexu vždy 0, abychom mohli
            // udělat rows[rowIndex][checkedValue] === checkedValue, čili abychom nemuseli posouvat index v poli
            [0, 0, 1, 2, 0, 8, 6, 0, 0, 0],
            [0, 3, 0, 4, 1, 6, 2, 8, 0, 0],
            [] // a další, čili 9 řádků celkem
        ],
        str: [
            // rows[rowIndex].join(""), nic jiného - kvůli mnohem snazší možnosti porovnat, zda jsou dvě pole stejné
            "0012086000",
            "0304162800",
            "" // ...
        ]
    },

    // stejně jako řádky výše, zleva doprava mít čísla ze sloupečků takhle pod sebou
    columns: {
        numbers: [
            [0, 0, 1, 2, 0, 8, 6, 0, 0, 0],
            []
        ],
        str: [
            "0012086000",
            ""
        ]
    },

    segments: {
        // stejně jako výše, 9 segmentů zleva doprava a zezhora dolů, vevnitř také zleva doprava a zezhora dolů,
        // včetně nultého indexu obsahujícím nulu
        numbers: [
            []
        ],
        str: [
            ""
        ]
    },

    hints: {
        // zde bude pole o 81 prvcích (9 x 9), v každém prvku je pak pole o 10 prvcích
        // čili nidy nebude probíhat iterace po všech hintech, ale bude to indexovaně s tím, že
        // pohyb po sloupcích bude mít pohyb po 9 indexech, místo po 1
        numbers: [
            []
        ],
        str: [
            ""
        ]
    }
}

function SudokuMap(props) {

    // FIXME this needs refactorization, we need to prepare some better optimized structures
    // hints should be sorted array of all items with null where there is no number
    // also we need hintsLeft property
    // also all of the checking algorithms are close to m*n^2, it has to be fixed and made better
    function prepareSolutionFromMap() {
        let chars = props.map.split("");
        let rows = [];
        let row = [];
        chars.forEach((char, i) => {
            let num = parseInt(char);
            row.push({
                value: num,
                solution: null,
                hints: num ? [] : [1, 2, 3, 4, 5, 6, 7, 8, 9],
                strHints: num ? "" : "123456789"
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
        });
    }

    function removeNumberFromHints(cellA, checkedValue) {
        let hintIndex = cellA.hints.indexOf(checkedValue);
        if (hintIndex > -1) {
            cellA.hints.splice(hintIndex, 1);
            cellA.strHints = cellA.hints.join("");
            return true;
        }
        return false;
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
                    removeNumberFromHints(cellA, checkedValue);
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
                    removeNumberFromHints(cellA, checkedValue);
                }
            }
        }
    }

    function forEachSegment(callback) {
        for (let rowSegmentI = 0; rowSegmentI <= 2; rowSegmentI++) {
            for (let colSegmentI = 0; colSegmentI <= 2; colSegmentI++) {
                callback(rowSegmentI, colSegmentI);
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
        forEachSegment((rowSegmentI, colSegmentI) => {
            forEachCellInSegment(rowSegmentI, colSegmentI, cellA => {
                if (cellA.value || cellA.solution) {
                    return;
                }

                forEachCellInSegment(rowSegmentI, colSegmentI, cellB => {
                    let checkedValue = cellB.value || cellB.solution;
                    if (!checkedValue) return;
                    removeNumberFromHints(cellA, checkedValue);
                });
            });
        });
    }

    function checkRowHintCombos() {
        forEachSegment((rowSegmentI, colSegmentI) => {
            for (let rowCellI = 0; rowCellI <= 2; rowCellI++) {
                for (let colCellI1 = 0; colCellI1 <= 2; colCellI1++) {
                    let firstColOfSegment = colSegmentI * 3;
                    let firstRowOfSegment = rowSegmentI * 3;
                    let currentRowI = firstRowOfSegment + rowCellI;
                    let cellA = solution[currentRowI][firstColOfSegment + colCellI1];
                    if (cellA.value || cellA.solution) {
                        continue;
                    }

                    for (let hint of cellA.hints) {
                        // first we need to check if there are multiple hints in a same row in same segment
                        let hintCombo = false;
                        for (let colCellI2 = 0; colCellI2 <= 2; colCellI2++) {
                            let cellB = solution[currentRowI][firstColOfSegment + colCellI2];
                            if (cellA === cellB) continue;
                            if (cellB.hints.indexOf(hint) > -1) hintCombo = true;
                        }
                        if (!hintCombo) continue;

                        // then we check if there are no same hints in any cell in other rows in same segment
                        for (let rowCellCheckedI = 0; rowCellCheckedI <= 2; rowCellCheckedI++) {
                            if (rowCellI === rowCellCheckedI) continue;

                            for (let colCellCheckedI = 0; colCellCheckedI <= 2; colCellCheckedI++) {
                                let cellB = solution[firstRowOfSegment + rowCellCheckedI][firstColOfSegment + colCellCheckedI];
                                if (cellB.value || cellB.solution) continue;
                                if (cellB.hints.indexOf(hint) > -1) {
                                    hintCombo = false;
                                    break;
                                }
                            }

                            if (!hintCombo) break;
                        }

                        // and if there are hints in segment in one row and no other row, then this whole row cannot
                        // contain the hint
                        if (hintCombo) {
                            let thisSegmentsColumns = [firstColOfSegment, firstColOfSegment + 1, firstColOfSegment + 2]
                            for (let colCellCheckedI = 0; colCellCheckedI <= 8; colCellCheckedI++) {
                                if (thisSegmentsColumns.indexOf(colCellCheckedI) > -1) continue;
                                let checkedCell = solution[currentRowI][colCellCheckedI];
                                if (checkedCell.value || checkedCell.solution) continue;
                                removeNumberFromHints(checkedCell, hint);
                            }
                        }
                    }
                }
            }
        });
    }

    function checkColHintCombos() {
        forEachSegment((rowSegmentI, colSegmentI) => {
            for (let colCellI = 0; colCellI <= 2; colCellI++) {
                for (let rowCellI1 = 0; rowCellI1 <= 2; rowCellI1++) {
                    let firstColOfSegment = colSegmentI * 3;
                    let firstRowOfSegment = rowSegmentI * 3;
                    let currentRowI = firstRowOfSegment + rowCellI1;
                    let currentColI = firstColOfSegment + colCellI;
                    let cellA = solution[currentRowI][currentColI];
                    if (cellA.value || cellA.solution) {
                        continue;
                    }

                    for (let hint of cellA.hints) {
                        // first we need to check if there are multiple hints in a same column in same segment
                        let hintCombo = false;
                        for (let rowCellI2 = 0; rowCellI2 <= 2; rowCellI2++) {
                            let cellB = solution[firstRowOfSegment + rowCellI2][currentColI];
                            if (cellA === cellB) continue;
                            if (cellB.hints.indexOf(hint) > -1) hintCombo = true;
                        }
                        if (!hintCombo) continue;

                        // then we check if there are no same hints in any cell in other columns in same segment
                        for (let colCellCheckedI = 0; colCellCheckedI <= 2; colCellCheckedI++) {
                            if (colCellI === colCellCheckedI) continue;

                            for (let rowCellCheckedI = 0; rowCellCheckedI <= 2; rowCellCheckedI++) {
                                let cellB = solution[firstRowOfSegment + rowCellCheckedI][firstColOfSegment + colCellCheckedI];
                                if (cellB.value || cellB.solution) continue;
                                if (cellB.hints.indexOf(hint) > -1) {
                                    hintCombo = false;
                                    break;
                                }
                            }

                            if (!hintCombo) break;
                        }

                        // and if there are hints in segment in one column and no other column, then this whole column
                        // cannot contain the hint
                        if (hintCombo) {
                            let thisSegmentsRows = [firstRowOfSegment, firstRowOfSegment + 1, firstRowOfSegment + 2]
                            for (let rowCellCheckedI = 0; rowCellCheckedI <= 8; rowCellCheckedI++) {
                                if (thisSegmentsRows.indexOf(rowCellCheckedI) > -1) continue;
                                let checkedCell = solution[rowCellCheckedI][currentColI];
                                if (checkedCell.value || checkedCell.solution) continue;
                                removeNumberFromHints(checkedCell, hint);
                            }
                        }
                    }
                }
            }
        });
    }

    // if there are for example cells with hints 2, 9 and 2, 9, then no other cell
    // can contain neither 2 nor 9 (because 2 and 9 have to be filled in the 2, 9 hinted cell)
    function checkSegmentNakedCombos() {
        forEachSegment((rowSegmentI, colSegmentI) => {
            forEachCellInSegment(rowSegmentI, colSegmentI, cellA => {
                if (cellA.value || cellA.solution) return;

                let otherComboCells = [cellA];
                forEachCellInSegment(rowSegmentI, colSegmentI, cellB => {
                    if (cellB.value || cellB.solution || cellA === cellB) return;

                    if (cellA.strHints === cellB.strHints) {
                        otherComboCells.push(cellB);
                    }
                });

                if (otherComboCells.length !== cellA.hints.length) return;

                forEachCellInSegment(rowSegmentI, colSegmentI, cellB => {
                    if (cellB.value || cellB.solution || otherComboCells.includes(cellB)) return;

                    cellA.hints.forEach(hint => {
                        removeNumberFromHints(cellB, hint);
                    });
                });
            });
        });
    }

    // if there are for example cells with hints 2, 9 and 2, 9, then no other cell in same row
    // can contain neither 2 nor 9 (because 2 and 9 have to be filled in the 2, 9 hinted cell)
    function checkRowNakedCombos() {
        for (let row of solution) {
            for (let cellA of row) {
                if (cellA.value || cellA.solution) continue;

                let otherComboCells = [cellA];
                for (let cellB of row) {
                    if (cellB.value || cellB.solution || cellA === cellB) continue;

                    if (cellA.strHints === cellB.strHints) {
                        otherComboCells.push(cellB);
                    }
                }

                if (otherComboCells.length === cellA.hints.length) {
                    for (let cellB of row) {
                        if (cellB.value || cellB.solution || otherComboCells.includes(cellB)) continue;

                        cellA.hints.forEach(hint => {
                            removeNumberFromHints(cellB, hint);
                        });
                    }
                }
            }
        }
    }

    // if there are for example cells with hints 2, 9 and 2, 9, then no other cell in same column
    // can contain neither 2 nor 9 (because 2 and 9 have to be filled in the 2, 9 hinted cell)
    function checkColumnNakedCombos() {
        for (let rowA of solution) {
            for (let cellIndex = 0; cellIndex < rowA.length; cellIndex++) {
                let cellA = rowA[cellIndex];
                if (cellA.value || cellA.solution) continue;

                let otherComboCells = [cellA];

                for (let rowB of solution) {
                    let cellB = rowB[cellIndex];
                    if (cellB.value || cellB.solution || cellA === cellB) continue;

                    if (cellA.strHints === cellB.strHints) {
                        otherComboCells.push(cellB);
                    }
                }

                if (otherComboCells.length === cellA.hints.length) {
                    for (let rowB of solution) {
                        let cellB = rowB[cellIndex];
                        if (cellB.value || cellB.solution || otherComboCells.includes(cellB)) continue;

                        cellA.hints.forEach(hint => {
                            removeNumberFromHints(cellB, hint);
                        });
                    }
                }
            }
        }
    }

    function fillSingleHintSolutions(all) {
        for (let row of solution) {
            for (let cell of row) {
                if (!cell.value && !cell.solution && cell.hints.length === 1) {
                    cell.solution = cell.hints[0];
                    cell.hints = [];
                    cell.strHints = "";
                    if (!all) return;
                }
            }
        }
    }

    function fillUniqueHintInRowSolutions(all) {
        let alreadyFilled = false;
        for (let row of solution) {
            if (!all && alreadyFilled) break;

            for (let cellA of row) {
                if (!all && alreadyFilled) break;

                if (cellA.value || cellA.solution) {
                    continue;
                }

                // copy of hints, because we modify the array during the iteration
                for (let hint of [...cellA.hints]) {
                    let uniqueHint = true;
                    for (let cellB of row) {
                        if (cellA === cellB) {
                            continue;
                        }

                        if (hint === cellB.value || hint === cellB.solution || cellB.hints.indexOf(hint) > -1) {
                            uniqueHint = false;
                            break;
                        }
                    }

                    if (uniqueHint && (all || (!all && !alreadyFilled))) {
                        cellA.solution = hint;
                        cellA.hints = [];
                        cellA.strHints = "";
                        alreadyFilled = true;
                        break;
                    }
                }
            }
        }
    }

    function fillUniqueHintInColumnSolutions(all) {
        let alreadyFilled = false;
        for (let rowA of solution) {
            if (!all && alreadyFilled) break;

            for (let cellIndex = 0; cellIndex < rowA.length; cellIndex++) {
                let cellA = rowA[cellIndex];
                if (cellA.value || cellA.solution) {
                    continue;
                }

                // copy of hints, because we modify the array during the iteration
                for (let hint of [...cellA.hints]) {
                    let uniqueHint = true;
                    for (let rowB of solution) {
                        let cellB = rowB[cellIndex];
                        if (cellA === cellB) {
                            continue;
                        }

                        if (hint === cellB.value || hint === cellB.solution || cellB.hints.indexOf(hint) > -1) {
                            uniqueHint = false;
                            break;
                        }
                    }

                    if (uniqueHint && (all || (!all && !alreadyFilled))) {
                        cellA.solution = hint;
                        cellA.hints = [];
                        cellA.strHints = "";
                        alreadyFilled = true;
                        break;
                    }
                }
            }
        }
    }

    function fillUniqueHintInSegmentSolutions(all) {
        let alreadyFilled = false;
        forEachSegment((rowSegmentI, colSegmentI) => {
            if (!all && alreadyFilled) return;

            forEachCellInSegment(rowSegmentI, colSegmentI, cellA => {
                if (!all && alreadyFilled) return;

                if (cellA.value || cellA.solution) {
                    return;
                }

                // copy of hints, because we modify the array during the iteration
                for (let hint of [...cellA.hints]) {
                    let uniqueHint = true;
                    forEachCellInSegment(rowSegmentI, colSegmentI, cellB => {
                        if (cellA === cellB) {
                            return;
                        }

                        if (hint === cellB.value || hint === cellB.solution || cellB.hints.indexOf(hint) > -1) {
                            uniqueHint = false;
                        }
                    })

                    if (uniqueHint && (all || (!all && !alreadyFilled))) {
                        cellA.solution = hint;
                        cellA.hints = [];
                        cellA.strHints = "";
                        alreadyFilled = true;
                        break;
                    }
                }
            });
        });
    }

    // handlers
    function handleSolveAll() {
        // TODO there should be some cycle to iteratively check for solution
        checkSameNumberInRow();
        checkSameNumberInColumn();
        check3to3segments();
        checkRowHintCombos();
        checkColHintCombos();
        checkSegmentNakedCombos();
        checkRowNakedCombos();
        checkColumnNakedCombos();
        fillSingleHintSolutions(true);
        fillUniqueHintInRowSolutions(true);
        fillUniqueHintInColumnSolutions(true);
        fillUniqueHintInSegmentSolutions(true);
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

    function handleCheckRowHintCombos() {
        checkRowHintCombos();
        setSolution([...solution]);
    }

    function handleCheckColHintCombos() {
        checkColHintCombos();
        setSolution([...solution]);
    }

    function handleCheckSegmentNakedCombos() {
        checkSegmentNakedCombos();
        setSolution([...solution]);
    }

    function handleCheckRowNakedCombos() {
        checkRowNakedCombos();
        setSolution([...solution]);
    }

    function handleCheckColumnNakedCombos() {
        checkColumnNakedCombos();
        setSolution([...solution]);
    }

    function handleFillSingleHintSolutions() {
        fillSingleHintSolutions(false);
        setSolution([...solution]);
    }

    function handleFillUniqueHintInRowSolutions() {
        fillUniqueHintInRowSolutions(false);
        setSolution([...solution]);
    }

    function handleFillUniqueHintInColumnSolutions() {
        fillUniqueHintInColumnSolutions(false);
        setSolution([...solution]);
    }

    function handleFillUniqueHintInSegmentSolutions() {
        fillUniqueHintInSegmentSolutions(false);
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

                <button onClick={handleCheckRowHintCombos}>
                    Solve rows with hint combos in segments
                </button>

                <button onClick={handleCheckColHintCombos}>
                    Solve columns with hint combos in segments
                </button>

                <button onClick={handleCheckSegmentNakedCombos}>
                    Solve segments with naked combos
                </button>

                <button onClick={handleCheckRowNakedCombos}>
                    Solve rows with naked combos
                </button>

                <button onClick={handleCheckColumnNakedCombos}>
                    Solve columns with naked combos
                </button>
            </div>

            <div>
                <button onClick={handleFillSingleHintSolutions}>
                    Solve cell with single hint
                </button>

                <button onClick={handleFillUniqueHintInRowSolutions}>
                    Solve cell with unique hint in row
                </button>

                <button onClick={handleFillUniqueHintInColumnSolutions}>
                    Solve cell with unique hint in column
                </button>

                <button onClick={handleFillUniqueHintInSegmentSolutions}>
                    Solve cell with unique hint in segment
                </button>
            </div>

            <div className={"sudoku-map"}>
                {renderMap()}
            </div>
        </div>
    );
}

export default SudokuMap;
