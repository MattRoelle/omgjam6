import Vue from "vue";

import C from "../constants";
import { GameBoard, GAME_STATES } from "../logic/game-board";
import { Dictionary } from "../logic/dictionary";
import wordsTxt from "../words.txt";


Vue.component("game", {
    template: `
        <div class="game-board">
            <div class="game-grid">
                <div class="game-grid-row" v-for="row in game.rows">
                    <div class="game-grid-cell" v-bind:class="{ 'under-shape': game.isShapeOverCell(cell) && game.state === 1, 'typing': game.isShapeOverCell(cell) && game.state === 2, 'cursor': cell.cursor }" v-for="cell in row">
                        <p v-bind:class="{ 'visible': !!cell.letter }">
                            <span>{{ cell.letter }}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            boardSz: C.BOARD_SIZE,
            game: new GameBoard(new Dictionary(wordsTxt))
        };
    },
    mounted() {
        window.addEventListener("keydown", (ev) => {
            this.handleKeydown(ev);
        });
    },
    methods: {
        handleKeydown(ev) {
            if (this.game.state == GAME_STATES.TYPING) {
                this.game.type(ev.key);
                return;
            }

            let dx = 0, dy = 0;

            switch(ev.key) {
                case 'w': dy = 1; break;
                case 's': dy = -1; break;
                case 'a': dx = 1; break;
                case 'd': dx = -1; break;
                case ' ': 
                case 'Enter': 
                    if (this.game.state == GAME_STATES.POSITIONING) {
                        this.game.changeState(GAME_STATES.TYPING);
                    }
                    return;
            }

            this.game.moveShape(dx, dy);
        }
    }
})