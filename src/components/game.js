import Vue from "vue";

import C from "../constants";
import { GameBoard, GAME_STATES } from "../logic/game-board";
import { Dictionary } from "../logic/dictionary";
import wordsTxt from "../words.txt";


Vue.component("game", {
    template: `
    <div class="word-game" v-bind:data-theme="((game.wordsPlayed + startingColorOffset)% 11) + 1">
        <div class="game-header">
            <div class="game-header-title">
                <h1>Lorum Ipsum</h1>
                <h2>By Matt Roelle<br />For OMGJAM6</h2>
            </div>
            <div class="game-action-bar">
                <p>WORDS PLAYED: <span class="data-point">{{ game.wordsPlayed }}</span></p>
                <p>SCORE: <span class="data-point">1272</span></p>
                <p><span class="data-point"><i class="fas fa-sync-alt"></i></span></p>
            </div>
        </div>
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
    </div>
    `,
    data() {
        return {
            boardSz: C.BOARD_SIZE,
            game: new GameBoard(new Dictionary(wordsTxt)),
            startingColorOffset: Math.floor(Math.random()*11),
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
                case 'q': this.game.wordsPlayed++; return;
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