import React, {useState} from 'react';
import "./sudoku-map.css";
import Grid from "./grid";

function MapView(props) {

    const [solution, setSolution] = useState(new Grid(props.map));
    const [showHints, setShowHints] = useState(true);

    function renderMap() {
        return solution.rows.map((row, i1) => {
            let cells = row.cells.map((cell, i2) => {
                if (showHints && !cell.solution) {
                    let hintsStr = "";
                    cell.hintsMap.forEach((hint) => hintsStr = hintsStr + hint);

                    return (
                        <div className={"sudoku-map-cell sudoku-map-cell-hints"} key={i2}>
                            <div>{hintsStr}</div>
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
