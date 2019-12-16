import Vue from "vue";

import C from "../constants";
import { GameBoard, GAME_STATES } from "../logic/game-board";
import { Dictionary } from "../logic/dictionary";
import wordsTxt from "../words.txt";

const dictionary = new Dictionary(wordsTxt);


Vue.component("game", {
    template: `
    <div class="word-game" v-bind:data-theme="((game.level + startingColorOffset)%5) + 1">
        <div class="game-header">
            <div class="game-header-title">
                <h1>Lorum Ipsum</h1>
                <h2>By Matt Roelle<br />For OMGJAM6</h2>
            </div>
            <div class="game-action-bar">
                <p>WORDS PLAYED: <span class="data-point">{{ game.wordsPlayed }} / {{ game.wordsToPlay }}</span></p>
                <p>SCORE: <span class="data-point">{{ game.score }}</span></p>
                <p>LEVEL: <span class="data-point">{{ game.level }}</span></p>
                <p @click="restart()"class="game-action-bar-action">Restart</p>
            </div>
        </div>
        <div class="game-board">
            <h1 v-bind:class="{ 'visible': game.state === 3 }">Level {{ game.level }}</h1>
            <div class="game-grid">
                <div class="game-grid-row" v-for="row in game.rows">
                    <div class="game-grid-cell" v-bind:class="{ 'under-shape': game.isShapeOverCell(cell) && game.state === 1, 'typing': game.isShapeOverCell(cell) && game.state === 2, 'cursor': cell.cursor, 'win': cell.win }" v-for="cell in row" @mouseover="hover(cell)" @click="click(cell)">
                        <p v-bind:class="{ 'visible': !!cell.letter }">
                            <span>{{ cell.letter }}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <p class="game-help-text">
            <span v-if="game.state == 1">Mouse to move&nbsp;&nbsp;|&nbsp;&nbsp;Enter to start typing&nbsp;&nbsp;|&nbsp;&nbsp;Must play off existing words.</span>
            <span v-if="game.state == 2">Typing&nbsp;&nbsp;|&nbsp;&nbsp;Enter to submit word&nbsp;&nbsp;|&nbsp;&nbsp;Must be a valid English word</span>
        </p>
    </div>
    `,
    data() {
        return {
            boardSz: C.BOARD_SIZE,
            game: new GameBoard(dictionary),
            startingColorOffset: Math.floor(Math.random()*11),
        };
    },
    mounted() {
        window.addEventListener("keydown", (ev) => {
            this.handleKeydown(ev);
        });
    },
    methods: {
        restart() {
            this.game = new GameBoard(dictionary);
        },
        hover(cell) {
            if (this.game.state == GAME_STATES.POSITIONING) {
                this.game.setShapePos(cell.x, cell.y);
            }
        },
        click(cell) {
            if (this.game.state == GAME_STATES.POSITIONING) {
                this.game.changeState(GAME_STATES.TYPING);
            } else {
                this.game.type("Escape");
                this.game.setShapePos(cell.x, cell.y);
                this.game.changeState(GAME_STATES.TYPING);
            }
        },
        handleKeydown(ev) {
            if (this.game.state == GAME_STATES.TYPING) {
                this.game.type(ev.key);
                return;
            }

            let dx = 0, dy = 0;

            switch(ev.key) {
                //case 'q': this.game.winLevel(); return;
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

            //this.game.moveShape(dx, dy);
        }
    }
})