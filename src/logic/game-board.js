import C from "../constants";
import { SHAPES } from "./shape";
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

        this.getNextShape();
    }

    getNextShape() {
        this.shape = SHAPES[Math.floor(Math.random()*SHAPES.length)];
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
    
    getCell(x, y) {
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
        this.state = newState;

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
            console.log(this.reservedLetters);
            this.ffwdCursor();
        }
    }

    type(letter) {
        if (this.state != GAME_STATES.TYPING) return;

        if (letter === "Enter" || letter === " " && this.cursorPos === this.shape.len) {
            this.submitWord();
            return;
        }

        if (letter === "Escape") {
            this.cursorPos = 0;
            for(let i = 0; i < this.shape.len; i++) {
                if (this.reservedLetters[i]) continue;
                this.word[i] = " ";
            }
            this.state = GAME_STATES.POSITIONING;
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

    submitWord() {
        if (this.dictionary.isValidWord(this.word.join(""))) {
            this.getNextShape();
            this.changeState(GAME_STATES.POSITIONING);
        }
    }

    updateBoard() {
        for(let i = 0; i < this.shape.len; i++) {
            const cellPos = this.shape.getCellPos(i);
            const cell = this.getCell(cellPos.x - this.shapeOffset.x, cellPos.y - this.shapeOffset.y);
            cell.letter = this.word[i].trim();
        }
    }
}

export {
    GameBoard,
    GAME_STATES,
}