import C from "../constants";
import { SHAPES, randomShape } from "./shape";
import { GAME_STATES, DIRECTIONS } from "./enums";

class GameBoard {
    constructor(dictionary) {
        this.dictionary = dictionary;
        this.state = GAME_STATES.POSITIONING;

        this.rows = [];
        for(let y = 0; y < C.BOARD_SIZE; y++) {
            const row = [];
            for(let x = 0; x < C.BOARD_SIZE; x++) {
                row.push({ x, y, letter: null });
            }
            this.rows.push(row);
        }

        this.wordsPlayed = 0;

        this.getNextShape();
        this.initBoard();
    }

    getNextShape() {
        this.shape = randomShape();
        this.word = [];
        this.cursorPos = 0;
        for(let i = 0; i < this.shape.len; i++) {
            this.word.push(" ");
        }

        for(let x = 0; x < C.BOARD_SIZE; x++) {
            for(let y = 0; y < C.BOARD_SIZE; y++) {
                const cell = this.getCell(x, y);
                cell.cursor = false;
            }
        }

        this.shapeOffset = {
            x: 0,
            y: 0
        };
    }

    initBoard() {
        console.log(this.shape.len);
        let startingWord = this.dictionary.sample(this.shape.len);

        this.changeState(GAME_STATES.TYPING);
        for(let i = 0; i < startingWord.length; i++) {
            this.type(startingWord[i]);
        }

        this.submitWord();
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
                this.ffwdCursor();
                this.updateBoard();
            }
        } else {
            this.state = newState;
        }
    }

    isValidShapePlacement() {
        if (this.wordsPlayed === 0 || this.reservedLetters.indexOf(true) > -1) {
            return true;
        }

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

    type(letter) {
        if (this.state != GAME_STATES.TYPING) return;

        if ((letter === "Enter" || letter === " ") && this.cursorPos === this.shape.len) {
            this.submitWord();
            return;
        }

        if (letter === "Escape") {
            this.cursorPos = 0;
            for(let i = 0; i < this.shape.len; i++) {
                if (this.reservedLetters[i]) continue;
                this.word[i] = " ";
            }
            this.changeState(GAME_STATES.POSITIONING);
            this.updateBoard();
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

        if (!cell.letter) return true;

        if (direction === DIRECTIONS.HORIZONTAL) {
            const lcell = this.getCell(x - 1, y);
            if (!!lcell.letter) return true;

            let nextX = x;
            while(!!(nextCell = this.getCell(nextX++, y)).letter) {
                word += nextCell.letter;
            }
        }

        if (direction === DIRECTIONS.VERTICAL) {
            const ucell = this.getCell(x, y - 1);
            if (!!ucell.letter) return true;

            let nextY = y;
            while(!!(nextCell = this.getCell(x, nextY++)).letter) {
                word += nextCell.letter;
            }
        }

        return word.length == 1 || this.dictionary.isValidWord(word);
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

    submitWord() {
        if (this.validateBoard()) {
            this.wordsPlayed++;
            this.getNextShape();
            this.changeState(GAME_STATES.POSITIONING);
        }
    }

    updateBoard() {
        for(let i = 0; i < this.shape.len; i++) {
            const cellPos = this.shape.getCellPos(i);
            const cell = this.getCell(cellPos.x - this.shapeOffset.x, cellPos.y - this.shapeOffset.y);
            cell.letter = this.word[i].trim();
            if (i == this.cursorPos) {
                cell.cursor = true;
            }
        }
    }
}

export {
    GameBoard,
    GAME_STATES,
}