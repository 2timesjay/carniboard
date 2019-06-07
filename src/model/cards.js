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
            let curCard = this.cardList[randIndex];
            let randIndex = Math.floor(numCards*Math.random());
            let randCard = this.cardList[randIndex];
            this.cardList[randIndex] = curCard;
            this.cardList[i] = randCard;
        }
    }
}

class Table extends Graph {
    constructor() {
        super();
    }
}