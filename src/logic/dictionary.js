export class Dictionary {
    constructor(wordsTxt) {
        this.wordsTxt = wordsTxt;

        this.words = this.wordsTxt.split('\n')
            .map(w => w.trim());
    }

    isValidWord(w) {
        return this.words.indexOf(w) > -1;
    }
}