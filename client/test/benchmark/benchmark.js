class Benchmark {
    constructor(iterations = 1000000) {
        this.iterations = iterations;
    }

    compare(...functions) {
        functions.forEach((func, i) => this._measure("Function " + (i + 1), func));
    }

    _measure(label, func) {
        console.time(label);
        for (let i = 0; i <= this.iterations; i++) {
            func();
        }
        console.timeEnd(label);
    }
}

module.exports = Benchmark;
