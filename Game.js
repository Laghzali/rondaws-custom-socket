
class Table {
  debugscore = 0
  toremove = []
  Thrownum = 0
  Round = 1
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
      this.CurrentScore.push({ p: x, score: 0, bont: 0 })
      let player = new Player(x)
      this.CurrentPlayers.push(player)
      player.setHand = this.deck.slice(this.SliceStart, this.SliceEnd)
      this.deck.splice(this.SliceStart, this.SliceEnd)
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

  CheckNext(card) {

    this.CurrentTable.forEach((cardInTable, index) => {
      if (card == cardInTable.number) {
        console.log('found' + card)

        this.CurrentScore.filter(score => {
          if (score.p === this.LastThrower)
            score.score += 1
        })

        this.CurrentTable.splice(index, 1)

        if (cardInTable.number == 7) {
          this.CheckNext(card + 3)
        } else {
          this.CheckNext(card + 1)
        }
      }
    })
  }

  //Throw card to the table
  set Throw(ThrownCard) {
    this.Thrownum += 1
    console.log('THROW NO : ' + this.Thrownum)

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

        this.CurrentScore.filter(score => {
          if (score.p === this.LastThrower) {
            console.log('addinf inw')
            score.score += 2
          }
        })

        //eat next
        if (ThrownCard.number == 7) {
          this.CheckNext(ThrownCard.number + 3)
        } else {
          this.CheckNext(ThrownCard.number + 1)
        }

        //check if BONT
        this.CurrentTable.splice(cardIndex, 1)
        if (this.LastCard.number === ThrownCard.number) {
          console.log('bont')
          this.CurrentScore.filter(score => {
            if (score.p === this.LastThrower)
              score.bont += 1
          })
        }

        //check for missa
        if (this.CurrentTable.length === 0) {
          this.CurrentScore.filter(score => {
            if (score.p === this.LastThrower)
              score.bont += 1
          })
        }

        //INCREASE SCORE WHEN THROW FINISHED

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

    this.CurrentPlayers.forEach((player, index) => {
      //rmove throwen card from last thrower

      if (player.PlayerID == this.LastThrower) {

        player.removeCard(ThrownCard)

      }
      //check if all players run out of cards
      if (this.CurrentPlayers.every(player => player.shouldDistribute() === true)) {
        this.shouldDistribute = true
        console.log('deck size : ' + this.deck.length)
        console.log('ROUND FINISHED ' + this.Round)
        this.Round += 1

      }


      //CHECK IF THE GAME SHOULD REDISTRIBUTE CARDS 
      if (this.shouldDistribute) {
        //CHECK IF SliceEND REACHED LAST ELEMENT WHICH MEANS THERE IS NO MORE CARDS TO DISTRIBUTE
        if (this.deck.length === 0) {
          this.Finished = true
          //ASSIGN SCORE EQUAL TO NUMBER OF CARDS LEFT ON TABLE WHEN GAME FINISHES
          this.CurrentScore.forEach(score => {
            if (score.p == this.LastEater) {
              score.score += this.CurrentTable.length - 1
            }
          })

          //clear table
          this.CurrentTable = []
          return
        }

        //REDISTRIBUTE 
        this.CurrentPlayers.forEach(player => {

          player.setHand = this.deck.slice(this.SliceStart, this.SliceEnd)
          this.deck.splice(this.SliceStart, this.SliceEnd)
        })
        this.shouldDistribute = false
      }
    })

    //PASS TURN 
    console.log('DECK SIZE : ' + this.deck.length)
    this.Turn += 1
    if (this.Turn >= this.maxPlayers)
      this.Turn = 0
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
  removeCard(cardToremove) {
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