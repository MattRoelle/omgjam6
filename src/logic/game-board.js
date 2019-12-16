import C from "../constants";
import { SHAPES, randomShape } from "./shape";
import { GAME_STATES, DIRECTIONS } from "./enums";

class GameBoard {
    constructor(dictionary) {
        this.dictionary = dictionary;

        this.clearBoard();

        this.wordsPlayed = 0;
        this.level = 0;
        this.wordsToPlay =  1;
        this.score = 0;

        this.winLevel();
        this.getNextShape();
    }

    pushBoard() {
        const data = [];
        for(let row of this.rows) {
            const newRow = [];
            for(let c of row) {
                newRow.push({ ...c });
            }
            data.push(newRow);
        }
        this.stack.push(data);
    }

    popBoard() {
        if (this.stack.length > 0) {
            this.rows = this.stack.pop();
        }
    }

    getNextShape() {
        do {
            this.shape = randomShape();
        } while (this.lastShapeDirection == this.shape.direction);

        this.lastShapeDirection = this.shape.direction;

        this.word = [];
        this.cursorPos = 0;
        for(let i = 0; i < this.shape.len; i++) {
            this.word.push(" ");
        }

        this.shapeOffset = {
            x: 0,
            y: 0
        };
    }

    clearCursor() {
        for(let x = 0; x < C.BOARD_SIZE; x++) {
            for(let y = 0; y < C.BOARD_SIZE; y++) {
                const cell = this.getCell(x, y);
                cell.cursor = false;
            }
        }
    }

    clearBoard() {
        this.stack = [];
        this.rows = [];
        for(let y = 0; y < C.BOARD_SIZE; y++) {
            const row = [];
            for(let x = 0; x < C.BOARD_SIZE; x++) {
                row.push({ x, y, letter: null });
            }
            this.rows.push(row);
        }
        this.pushBoard();
    }

    nextLevel() {
        this.clearBoard();
        const difficulty = this.level + 1;
        this.state = GAME_STATES.POSITIONING;

        //this.wordsToPlay = 1;
        this.wordsPlayed = 0;
        this.wordsToPlay = Math.floor(difficulty/2 + difficulty/3) 
        this.wordsToPlay = Math.max(this.wordsToPlay, 1);
        this.wordsToPlay = Math.min(this.wordsToPlay, 8);

        const words = [];
        let word;
        let letters;
        for(let i = 0; i < difficulty; i++) {
            do {
                word = this.dictionary.sample(Math.floor(Math.random()*3) + 3)
                letters = word.split("");
            } while (words.length > 0 && words[words.length - 1].split("").find(c => letters.indexOf(c) > -1) == null);
            words.push(word);
        }

        const minX = 1;
        const minY = 1;
        const maxX = C.BOARD_SIZE - 1;
        const maxY = C.BOARD_SIZE - 1;

        let lastWord;
        let direction = Math.random() > 0.5 ? DIRECTIONS.HORIZONTAL : DIRECTIONS.VERTICAL;

        let wordsPlaced = 0;

        for(let word of words) {
            if (wordsPlaced > 8) break;

            let x, y, overlappingIndices;

            /*
            if (!!lastWord) {
                overlappingIndices = [];
                const currentLetters = word.split("");
                const lastLetters = lastWord.word.split("");

                for(let i = 0; i < currentLetters.length; i++) {
                    for(let j = 0; j < lastLetters.length; j++) {
                        if (currentLetters[i] == lastLetters[j]) {
                            overlappingIndices.push([i, j]);
                        }
                    }
                }

                if (overlappingIndices.length === 0) continue;
            }
            */

            if (direction === DIRECTIONS.HORIZONTAL) {
                x = minX + Math.floor(Math.random()*((maxX - word.length) - minX));
                //if (!lastWord) {
                    y = minY + Math.floor(Math.random()*(maxY - minY));
                //} else {
                    //y = lastWord.y + overlappingIndices[0][1];
                //}
            } else {
                y = minY + Math.floor(Math.random()*((maxY - word.length) - minY));
                //if (!lastWord) {
                    x = minX + Math.floor(Math.random()*(maxX - minX));
                //} else {
                    //x = lastWord.x + overlappingIndices[0][1];
                //}
            }

            this.pushBoard();

            /*
            const data = {
                x,
                y,
                direction,
                word
            };
            */

            for(let i = 0; i < word.length; i++) {
                const letter = word[i];
                let wx, wy;
                if (direction == DIRECTIONS.HORIZONTAL) {
                    wx = x + i;
                    wy = y;
                } else {
                    wx = x;
                    wy = y + i;
                }
                this.getCell(wx, wy).letter = letter;
            }

            if (this.validateBoard()) {
                wordsPlaced++;
                //lastWord = data;
                this.lastShapeDirection = direction;
                direction = direction == DIRECTIONS.HORIZONTAL ? DIRECTIONS.VERTICAL : DIRECTIONS.HORIZONTAL;
            } else {
                this.popBoard();
            }
        }

        /*
        let startingWord = this.dictionary.sample(this.shape.len);

        this.changeState(GAME_STATES.TYPING);
        for(let i = 0; i < startingWord.length; i++) {
            this.type(startingWord[i]);
        }

        this.submitWord();
        */
    }
    
    getCell(x, y) {
        if (x < 0 || y < 0 || x >= C.BOARD_SIZE || y >= C.BOARD_SIZE) return { x, y, letter: "" };
        return this.rows[y][x];
    }

    isShapeOverCell(cell) {
        const x = cell.x;
        const y = cell.y;

        const ox = x + this.shapeOffset.x;
        const oy = y + this.shapeOffset.y;

        return (
            oy >= 0 && oy < this.shape.data.length &&
            ox >= 0 && ox < this.shape.data[0].length &&
            !!this.shape.data[oy][ox]
        );
    }

    setShapePos(x, y) {
        this.shapeOffset.x = this.shape.minX - x;
        this.shapeOffset.y = this.shape.minY - y;
    }

    moveShape(dx, dy) {
        if (this.state !== GAME_STATES.POSITIONING) return;

        this.shapeOffset.x += dx;
        this.shapeOffset.y += dy;

        this.shapeOffset.x = Math.min(this.shape.minX, this.shapeOffset.x);
        this.shapeOffset.x = Math.max(-this.shape.maxX, this.shapeOffset.x);
        this.shapeOffset.y = Math.min(this.shape.minY, this.shapeOffset.y);
        this.shapeOffset.y = Math.max(-this.shape.maxY, this.shapeOffset.y);
    }

    changeState(newState) {
        if (this.state === GAME_STATES.WINNING) return;

        if (newState === GAME_STATES.TYPING) {
            this.reservedLetters = [];
            for(let i = 0; i < this.shape.len; i++) {
                const cellPos = this.shape.getCellPos(i);
                const cell = this.getCell(cellPos.x - this.shapeOffset.x, cellPos.y - this.shapeOffset.y);
                if (!!cell.letter) {
                    this.reservedLetters.push(true);
                    this.word[i] = cell.letter;
                } else {
                    this.reservedLetters.push(false);
                }
            }
            if (this.isValidShapePlacement()) {
                this.state = newState;
                this.resetWord();
                this.ffwdCursor();
            }
        } else {
            this.state = newState;
        }

        this.updateBoard();
    }

    isValidShapePlacement() {
        /*
        if (this.wordsPlayed === 0 || this.reservedLetters.indexOf(true) > -1) {
            return true;
        }
        */

        for(let i = 0; i < this.shape.len; i++) {
            const cellPos = this.shape.getCellPos(i);
            const cx = cellPos.x - this.shapeOffset.x;
            const cy = cellPos.y - this.shapeOffset.y;
            if (
                !!this.getCell(cx - 1, cy).letter ||
                !!this.getCell(cx + 1, cy).letter ||
                !!this.getCell(cx, cy - 1).letter ||
                !!this.getCell(cx, cy + 1).letter
            ) {
                return true;
            }
        }

        return false;
    }

    resetWord() {
        for(let i = 0; i < this.shape.len; i++) {
            if (!this.reservedLetters[i]) {
                this.word[i] = " ";
            }
        }
    }

    type(letter) {
        if (this.state != GAME_STATES.TYPING) return;

        if ((letter === "Enter" || letter === " ") && this.cursorPos === this.shape.len) {
            this.submitWord();
            return;
        }

        if (letter === "Escape") {
            this.cursorPos = 0;
            this.resetWord();
            this.updateBoard();
            this.changeState(GAME_STATES.POSITIONING);
            return;
        }

        if (letter === "Backspace") {
            if (this.cursorPos > 0) {
                do {
                    this.cursorPos--;
                } while(this.cursorPos > 0 && this.reservedLetters[this.cursorPos]);

                if (!this.reservedLetters[this.cursorPos]) {
                    this.word[this.cursorPos] = " ";
                }
            }
            this.updateBoard();
            return;
        }

        if (!letter || letter.trim().length === 0 || !(/^[a-z]$/i).test(letter)) return;

        if (this.cursorPos >= this.shape.len) return;

        this.word[this.cursorPos] = letter;
        this.cursorPos++;
        this.ffwdCursor();
        this.updateBoard();
    }

    ffwdCursor() {
        while (this.reservedLetters[this.cursorPos] && this.cursorPos < this.shape.len) {
            this.cursorPos++;
        }
    }

    validateCell(x, y, direction) {
        const cell = this.getCell(x, y);
        let nextCell = null;
        let word =  "";
        let hasNeighbor = false;

        if (!cell.letter) return true;

        if (direction === DIRECTIONS.HORIZONTAL) {
            const lcell = this.getCell(x - 1, y);
            if (!!lcell.letter) return true;

            let nextX = x;

            while(!!(nextCell = this.getCell(nextX++, y)).letter) {
                if (
                    !!this.getCell(nextCell.x, nextCell.y + 1).letter ||
                    !!this.getCell(nextCell.x, nextCell.y - 1).letter
                ) {
                    hasNeighbor = true;
                }
                word += nextCell.letter;
            }
        }

        if (direction === DIRECTIONS.VERTICAL) {
            const ucell = this.getCell(x, y - 1);
            if (!!ucell.letter) return true;

            let nextY = y;
            while(!!(nextCell = this.getCell(x, nextY++)).letter) {
                if (
                    !!this.getCell(nextCell.x, nextCell.y + 1).letter ||
                    !!this.getCell(nextCell.x, nextCell.y - 1).letter
                ) {
                    hasNeighbor = true;
                }
                word += nextCell.letter;
            }
        }

        return !hasNeighbor || word.length == 1 || this.dictionary.isValidWord(word);
    }

    validateBoard() {
        for(let y = 0; y < C.BOARD_SIZE; y++) {
            for(let x = 0; x < C.BOARD_SIZE; x++) {
                if (!this.validateCell(x, y, DIRECTIONS.HORIZONTAL) || !this.validateCell(x, y, DIRECTIONS.VERTICAL)) {
                    return false;
                }
            }
        }
        return true;
    }

    winLevel() {
        this.level++;
        this.state = GAME_STATES.WINNING;

        const at = 20;

        for(let x = 0; x < C.BOARD_SIZE; x++) {
            for(let y = 0; y < C.BOARD_SIZE; y++) {
                const c = this.getCell(x, y);
                if (!!c.letter) {
                    this.score += (3 * this.level);
                }
                c.win = true;
            }
        }

        setTimeout(() => {
            this.nextLevel();
        }, 1800);
    }

    submitWord() {
        if (this.validateBoard()) {
            this.wordsPlayed++;
            if (this.wordsPlayed >= this.wordsToPlay) {
                this.winLevel();
            }
            //this.findRects();
            this.getNextShape();
            this.changeState(GAME_STATES.POSITIONING);
        }
    }

    findRects() {
        const openTileCount = this.rows.map(r => r.filter(c => !c.letter).length).reduce((a, b) => a + b);
        for(let x = 0; x < C.BOARD_SIZE; x++) {
            for(let y = 0; y < C.BOARD_SIZE; y++) {
                const cell = this.getCell(x, y);
                if (!!cell.letter) continue;

                // Check if cell is surrounded by letters
                let cu, cd, cl, cr

                for(let dx = 1; dx < C.BOARD_SIZE; dx++) {
                    if (this.getCell(x + dx, y ).letter) cr = true;
                    if (this.getCell(x - dx, y ).letter) cl = true;
                }

                for(let dy = 1; dy < C.BOARD_SIZE; dy++) {
                    if (this.getCell(x, y + dy).letter) cu = true;
                    if (this.getCell(x, y - dy).letter) cd = true;
                }

                if (cu && cd && cl && cr) {
                    const ff = this.floodFill(x, y);
                    if (ff.count < openTileCount) {
                        this.processRect(ff);
                        return;
                    }
                }
            }
        }
    }

    processRect(ff) {
        for(let x = ff.minX; x <= ff.maxX; x++) {
            for(let y = ff.minY; y <= ff.maxY; y++) {
                const cell = this.getCell(x, y);
                cell.letter = "";
            }
        }
    }

    floodFill(x, y, state) {
        if (x < 0 || y < 0 || x >= C.BOARD_SIZE || y >= C.BOARD_SIZE) return; 

        state = state || {
            minX: x,
            maxX: x,
            minY: y,
            maxY: y,
            count: 0,
            checked: {}
        };

        state.checked[x] = state.checked[x] || {};
        if (state.checked[x][y]) return state;
        state.checked[x][y] = true;

        const cell = this.getCell(x, y);
        if (!cell.letter) {
            state.count++;
        } else {
            if (x < state.minX) state.minX = x;
            if (x > state.maxX) state.maxX = x;

            if (y < state.minY) state.minY = y;
            if (y > state.maxY) state.maxY = y;

            return state;
        }

        this.floodFill(x + 1, y, state);
        this.floodFill(x - 1, y, state);
        this.floodFill(x, y + 1, state);
        this.floodFill(x, y - 1, state);

        return state;
    }

    updateBoard() {
        this.clearCursor();

        for(let i = 0; i < this.shape.len; i++) {
            const cellPos = this.shape.getCellPos(i);
            const cell = this.getCell(cellPos.x - this.shapeOffset.x, cellPos.y - this.shapeOffset.y);
            if (this.state == GAME_STATES.TYPING) {
                cell.letter = this.word[i].trim();
                if (i == this.cursorPos) {
                    cell.cursor = true;
                }
            }
        }
    }
}

export {
    GameBoard,
    GAME_STATES,
}