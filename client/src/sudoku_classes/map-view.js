import React, {useState} from 'react';
import "./sudoku-map.css";
import Grid from "./grid";

function prepareGrid(initialPattern) {
    return new Grid(initialPattern);
}

function MapView(props) {

    const [solution, setSolution] = useState(prepareGrid(props.map));
    const [showHints, setShowHints] = useState(true);

    function renderMap() {
        return solution.rows.map((row, i1) => {
            let cells = row.cells.map((cell, i2) => {
                if (showHints && !cell.solution) {
                    return (
                        <div className={"sudoku-map-cell sudoku-map-cell-hints"} key={i2}>
                            <div>{cell.hints}</div>
                        </div>
                    )
                } else {
                    let extraClass = cell.solution ? " sudoku-map-cell-solved" : ""
                    return (
                        <div className={"sudoku-map-cell" + extraClass} key={i2}>
                            {cell.solution}
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

    return (
        <div className={"sudoku-map-wrapper"}>
            <div>
                <button onClick={() => setShowHints(!showHints)}>
                    {showHints ? "Hide hints" : "Show hints"}
                </button>
            </div>

            <div>
                <button>
                    TODO control
                </button>
            </div>

            <div className={"sudoku-map"}>
                {renderMap()}
            </div>
        </div>
    );
}

export default MapView;
