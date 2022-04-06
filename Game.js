
class Table {
  CurrentTable = [];
  CurrentScore = []
  CurrentPlayers = []
  LastThrower;
  LastCard;
  Turn = 0
  deck = []
  LastEater;
  SliceStart = 0
  SliceEnd = 4
  Finished = false
  shouldDistribute = false
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

    CNumbers.forEach((NUM) => {
      CTypes.flatMap(TYPE => {

        this.deck.push({ number: NUM, type: TYPE })
      })
    })
    //shuffle deck (deck[] array)
    shuffle(this.deck)


    //Create players on table and distriute 3 cards to each player

    for (var x = 0; x < this.maxPlayers; x++) {
      this.CurrentScore.push({ p: x, score: 0 })
      let player = new Player(x)
      this.CurrentPlayers.push(player)
      player.setHand = this.deck.slice(this.SliceStart, this.SliceEnd)

      this.SliceEnd += 4
      this.SliceStart += 4

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
        if (cardInTable.number === 7) {
          this.CheckNext(card + 3, table)
        }
        this.CheckNext(card + 1, table)
      }
    })
    return score
  }
  //Throw card to the table
  set Throw(ThrownCard) {
    let pscore = 0

    if (this.Turn != this.LastThrower) {
      console.log('not your turn')
      console.log('Player : ' + this.Turn + 'TURN')
      return
    }

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
        //SET THIS PLAYER AS THE LAST EATER
        this.LastEater = this.LastThrower
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
    //INCREASE SCORE WHEN ROUND FINISHED
    this.CurrentScore.forEach(score => {
      if (score.p === this.LastThrower) {
        score.score += pscore
      }
    })
    //PASS TURN
    this.Turn += 1
    if (this.Turn >= this.maxPlayers)
      this.Turn = 0
    pscore = 0


    this.CurrentPlayers.forEach(player => {
      //rmove throwen card from last thrower
      if (player.PlayerID == this.LastThrower) {
        player.removeCard = ThrownCard
      }
      //check if all players run out of cards
      if (this.CurrentPlayers.every(player => player.shouldDistribute() === true)) {
        this.shouldDistribute = true
      }
      //CHECK IF THE GAME SHOULD REDISTRIBUTE CARDS 
      if (this.shouldDistribute) {
        //CHECK IF SliceEND REACHED LAST ELEMENT WHICH MEANS THERE IS NO MORE CARDS TO DISTRIBUTE
        if (this.SliceEnd >= this.deck.length) {
          this.Finished = true
          //REMOVE CARDS FROM TABLE WHEN GAMES FINISHES

          //clear table
          this.CurrentTable = []
          //ASSIGN SCORE EQUAL TO NUMBER OF CARDS LEFT ON TABLE WHEN GAME FINISHES
          this.CurrentScore.forEach(score => {
            if (score.p === this.LastEater) {
              score.score += this.CurrentTable.length
            }
          })
          console.log(this.CurrentScore)
          console.log('finished')
          return
        }
        this.CurrentPlayers.forEach(player => {
          player.setHand = this.deck.slice(this.SliceStart, this.SliceEnd)
          console.log('try')
          console.log(this.deck.slice(this.SliceStart, this.SliceEnd))

          this.SliceEnd += 4
          this.SliceStart += 4
        })
        this.shouldDistribute = false
      }
    })
  }
}

class Player {
  PlayerHand;
  PlayerID;

  constructor(ID) {
    this.PlayerID = ID;
  }
  shouldDistribute() {
    if (this.PlayerHand.length == 0) {
      return true
    }
    return false
  }
  set removeCard(cardToremove) {
    this.PlayerHand.forEach((mycard, index) => {

      if (JSON.stringify(mycard) === JSON.stringify(cardToremove)) {
        this.PlayerHand.splice(index, 1)
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