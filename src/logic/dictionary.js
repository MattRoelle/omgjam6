import C from "../constants";

export class Dictionary {
    constructor(wordsTxt) {
        this.wordsTxt = wordsTxt;

        this.words = {};

        const rawWords = this.wordsTxt.split('\n').map(w => w.trim().toLowerCase());
        for(let w of rawWords) {
            if (!this.words[w.length]) this.words[w.length] = [];
            this.words[w.length].push(w);
        }
    }

    isValidWord(w) {
        return this.words[w.length].indexOf(w) > -1;
    }

    sample(sz) {
        return this.words[sz][Math.floor(Math.random()*this.words[sz].length)];
    }
}