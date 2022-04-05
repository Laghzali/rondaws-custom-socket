
class Table {
  CurrentTable = [];
  CurrentScore = []
  CurrentPlayers = []
  LastThrower;
  LastCard;
  Turn = 0;
  constructor(Players) {
    this.maxPlayers = Players;
  }

  //initilize table and assing cards to players , construct the deck and distrubite cards
  init() {
    console.log('initiating game')

    //shuffle function
    function shuffle(array) {
      for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
      }
    }
    //Construct the deck with 40 cards with different types
    const CTypes = ['A', 'B', 'C', 'D']
    const CNumbers = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12]
    const deck = []
    CNumbers.forEach((NUM) => {
      CTypes.flatMap(TYPE => {

        deck.push({ number: NUM, type: TYPE })
      })
    })
    //shuffle deck (deck[] array)
    shuffle(deck)
    var SliceStart = 0
    var SliceEnd = 4

    //Create players on table and distriute 3 cards to each player

    for (var x = 0; x < this.maxPlayers; x++) {
      this.CurrentScore.push({ p: 1, score: 0 })
      let player = new Player(x)
      this.CurrentPlayers.push(player)
      player.setHand = deck.slice(SliceStart, SliceEnd)
      SliceEnd += 4
      SliceStart += 4
    }

  }


  //return players on the table
  get Players() {

    return this.CurrentPlayers.map(p => {
      return { pid: p.PlayerID, phand: p.getHand }
    })
  }

  //Set thrower ID , useful for assigning score to the correct player
  set Thrower(ID) {

    this.LastThrower = ID;
  }

  CheckNext(card, table) {
    let score = 0
    table.forEach((cardInTable, index) => {
      if (card == cardInTable.number) {
        console.log('found' + card)
        score += 1
        this.CurrentTable.splice(index, 1)
        this.CheckNext(card + 1, table)
      }
    })
    return score
  }
  //Throw card to the table
  set Throw(ThrownCard) {
    let pscore = 0

    if (this.Turn != this.LastThrower) {
      console.log('Player : ' + this.Turn + 'TURN')
      return
    }

    this.CurrentPlayers.forEach(player => {
      if (player.PlayerID == this.LastThrower) {
        player.removeCard = ThrownCard
      }
    })
    ////CHECK IF CurrentTable.card.number is equal to throwencard.number (check if makla)
    ////CHECK IF there is pottentiol multi eat (loop through currenttable and check if nextCard is eatable )
    if (this.CurrentTable.length > 0) {
      let cardExist = false
      let cardIndex
      this.CurrentTable.forEach((card, index) => {
        if (card.number === ThrownCard.number) {
          cardExist = true;
          cardIndex = index;
        }
      })
      if (cardExist) {
        //check if BONT score +2
        this.CurrentTable.splice(cardIndex, 1)
        if (this.LastCard.number === ThrownCard.number) {
          console.log('bont')
          pscore += 1
          if (ThrownCard.number == 7) {
            pscore += this.CheckNext(ThrownCard.number + 3, this.CurrentTable)
          } else {
            pscore += this.CheckNext(ThrownCard.number + 1, this.CurrentTable)
          }
          //check for missa
          if (this.CurrentTable.length === 0) {
            pscore += 1
            console.log('misaa')
          }
          //check if normal eating +1
        } else {
          pscore += 1
          if (ThrownCard.number == 7) {
            pscore += this.CheckNext(ThrownCard.number + 3, this.CurrentTable)
          } else {
            pscore += this.CheckNext(ThrownCard.number + 1, this.CurrentTable)
          }
          //check for missa
          if (this.CurrentTable.length === 0) {
            pscore += 1
            console.log('misaa')
          }
        }

      } else {
        console.log('throw')
        this.CurrentTable.push(ThrownCard)
        this.LastCard = ThrownCard;
      }
    }
    else {
      console.log("Adding first card to the table")
      this.CurrentTable.push(ThrownCard)
      this.LastCard = ThrownCard;
    }
    this.CurrentScore.forEach(score => {
      if (score.p === this.LastThrower) {
        score.score += pscore
      }
    })
    this.Turn += 1
    pscore = 0
  }
}

class Player {
  PlayerHand;
  PlayerID;

  constructor(ID) {
    this.PlayerID = ID;
  }
  set removeCard(cardToremove) {
    this.PlayerHand.forEach((mycard, index) => {

      if (JSON.stringify(mycard) === JSON.stringify(cardToremove)) {
        console.log(this.PlayerHand.splice(index, 1))


      }
    })
  }
  set setHand(cards) {
    this.PlayerHand = cards

  }
  get getHand() {

    return this.PlayerHand
  }
}


exports.Ronda = Table