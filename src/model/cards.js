entity = require("./entity");
AbstractEntity = entity.AbstractEntity;

graph = require("./graph");
Graph = graph.Graph;

class Card extends AbstractEntity {
    constructor() {
        super();
    }
}

class Deck extends AbstractEntity {
    constructor(cardList) {
        super();
        this.cardList = cardList;
    }

    shuffle() {
        let numCards = this.cardList.length;
        for(let i = 0; i < numCards; i++){
            // Swap card at position i in deck with card at random position.
            let curCard = this.cardList[i];
            let randIndex = Math.floor(numCards*Math.random());
            let randCard = this.cardList[randIndex];
            this.cardList[randIndex] = curCard;
            this.cardList[i] = randCard;
        }
    }

    draw(n) {
        let drawnCards = [];
        for (let i = 0; i < n; i++){
            draws.push(this.cardList.pop());
        }
        return drawnCards;
    }

    shuffleIn(newCards){
        this.cardList = this.cardList.push(...newCards);
        this.shuffle();
    }
}

class Table extends Graph {
    constructor() {
        super();
    }
}