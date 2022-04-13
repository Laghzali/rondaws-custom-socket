
class Table {
  Thrownum = 0
  Round = 0
  CurrentTable = [];
  CurrentScore = []
  teamScore = []
  CurrentPlayers = []
  LastThrower;
  LastCard;
  Turn = 0
  deck = []
  LastEater;
  SliceStart = 0
  SliceEnd = 4
  gameOfFour = false
  distCount = 1
  Finished = false
  shouldDistribute = false
  constructor(Players) {
    this.maxPlayers = Players;
  }

  teamScoreGenerator() {
    this.teamScore.forEach(score => {
      if (score.team == 1) {
        score.hbel = this.CurrentScore[0].hbel + this.CurrentScore[2].hbel
        score.bont = this.CurrentScore[0].bont + this.CurrentScore[2].bont
        score.push = this.CurrentScore[0].push + this.CurrentScore[2].push
      } else {
        score.hbel = this.CurrentScore[1].hbel + this.CurrentScore[3].hbel
        score.bont = this.CurrentScore[1].bont + this.CurrentScore[3].bont
        score.push = this.CurrentScore[1].push + this.CurrentScore[3].push
      }
    })
    return this.teamScore
  }

  generatePlayers() {
    if (this.maxPlayers > 3)
      this.gameOfFour = true
    let team = 1
    for (var x = 0; x < this.maxPlayers; x++) {
      this.CurrentScore.push({ p: x, score: 0, bont: 0, hbel: 0, push: 0 })

      let player = new Player(x)
      this.CurrentPlayers.push(player)
      player.setHand = this.deck.slice(this.SliceStart, this.SliceEnd)
      this.deck.splice(this.SliceStart, this.SliceEnd)
    }

    this.teamScore.push({
      team: 1,
      score: 0,
      hbel: 0,
      bont: 0,
      push: 0
    })
    this.teamScore.push({
      team: 2,
      score: 0,
      hbel: 0,
      bont: 0,
      push: 0
    })


  }
  //Construct the deck with 40 cards with different types
  generateDeck() {
    const CTypes = ['A', 'B', 'C', 'D']
    const CNumbers = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12]
    let deck = []
    CNumbers.forEach((NUM) => {
      CTypes.flatMap(TYPE => {

        deck.push({ number: NUM, type: TYPE })
      })
    })
    //shuffle function
    function shuffle(array) {
      for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
      }
    }

    shuffle(deck)
    return deck
  }

  //initilize table and assing cards to players , construct the deck and distrubite cards
  init() {
    console.log('initiating game')

    //generate and shuffle deck (deck[] array)
    this.deck = this.generateDeck()


    //Create players on table and distriute 4 cards to each player
    this.generatePlayers()
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
  score(count, id) {
    //this function is the dumbest shit ever written !!! stay away from it at any cost !!!
    console.log('called with count : ' + count)

    if (count != null) {
      //team score
      if (id == 0 || id == 2) {

        this.teamScore[0].hbel += Math.floor((this.teamScore[0].bont + count) / 5)
        this.teamScore[0].bont = ((this.teamScore[0].bont + count) % 5)

        if (this.teamScore[0].hbel > 4) {
          this.teamScore[0].push += 1
          this.teamScore[0].hbel -= 5
          console.log('PUSH ', score.push)
        }
      } else {
        this.teamScore[1].hbel += Math.floor((this.teamScore[1].bont + count) / 5)
        this.teamScore[1].bont = ((this.teamScore[1].bont + count) % 5)

        if (this.teamScore[1].hbel > 4) {
          this.teamScore[1].push += 1
          this.teamScore[1].hbel -= 5
          console.log('PUSH ', score.push)
        }
      }
      //end team score
      //for induvidual score
      this.CurrentScore.forEach(score => {
        if (score.p == id) {
          score.hbel += Math.floor((score.bont + count) / 5)
          score.bont = ((score.bont + count) % 5)

          if (score.hbel > 4) {
            score.push += 1
            score.hbel -= 5
            console.log('PUSH ', score.push)
          }
        }

      })
      /////end ind score
      return
    }
    ///team score
    if (this.LastThrower == 0 || this.LastThrower == 2) {

      if (this.teamScore[0].bont < 4) {
        this.teamScore[0].bont += 1
      } else {
        if (this.teamScore[0].hbel < 4) {
          this.teamScore[0].hbel += 1
          this.teamScore[0].bont = 0
        } else {
          this.teamScore[0].push += 1
          this.teamScore[0].hbel = 0
        }
      }

    } else {
      if (this.teamScore[1].bont < 4) {
        this.teamScore[1].bont += 1
      } else {
        if (this.teamScore[1].hbel < 4) {
          this.teamScore[1].hbel += 1
          this.teamScore[1].bont = 0
        } else {
          this.teamScore[1].push += 1
          this.teamScore[1].hbel = 0
        }
      }
    }
    ///end team score
    //indv score
    this.CurrentScore.filter(score => {
      if (score.p == this.LastThrower) {

        if (score.bont < 4) {
          score.bont += 1
        } else {
          if (score.hbel < 4) {
            score.hbel += 1
            score.bont = 0
          } else {
            score.push += 1
            score.hbel = 0
          }
        }
      }

    })

  }
  eat(ThrownCard) {
    ////CHECK IF CurrentTable.card.number is equal to throwencard.number (check if makla)
    ////CHECK IF there is pottentiol multi eat (loop through currenttable and check if nextCard is eatable )
    if (this.CurrentTable.length > 0) {
      let cardExist = false
      let cardIndex
      this.CurrentTable.forEach((card, index) => {
        if (card.number == ThrownCard.number) {
          cardExist = true;
          cardIndex = index;
        }
      })
      if (cardExist) {
        //SET THIS PLAYER AS THE LAST EATER
        this.LastEater = this.LastThrower
        //check if BONT
        if (this.LastCard.number == ThrownCard.number)
          this.score(null)

        this.CurrentScore.forEach(player => {
          if (player.p == this.LastThrower)
            player.score += 1
        })

        this.CheckNext(ThrownCard.number)

        //check for missa
        if (this.CurrentTable.length == 0) {
          this.score(null)
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

  }
  CheckNext(throwncard) {
    if (!this.CurrentTable.some(card => card.number === throwncard))
      return
    //find index of the card
    console.log('found  : ' + throwncard)
    let index = this.CurrentTable.findIndex(card => card.number === throwncard)

    //remove it from table 
    this.CurrentTable.splice(index, 1)
    //assign score
    this.CurrentScore.forEach(player => {
      if (player.p == this.LastThrower)
        player.score += 1
    })
    //check for the next card
    if (throwncard == 7)
      this.CheckNext(throwncard + 3)
    this.CheckNext(throwncard + 1)


  }
  distribute() {
    if (this.shouldDistribute) {
      //CHECK IF SliceEND REACHED LAST ELEMENT WHICH MEANS THERE IS NO MORE CARDS TO DISTRIBUTE
      if (this.deck.length === 0) {
        //ASSIGN SCORE EQUAL TO NUMBER OF CARDS LEFT ON TABLE WHEN GAME FINISHES
        this.CurrentScore.forEach(score => {
          if (score.p == this.LastEater) {
            score.score += this.CurrentTable.length
            console.log(this.CurrentScore)
          }
        })

        //calculate final round score
        let teamscore2 = 0
        let teamscore1 = 0

        this.CurrentScore.forEach(score => {
          if (score.p == 0 || score.p == 2) {
            teamscore1 += score.score
          } else {
            teamscore2 += score.score

          }
        })

        if (teamscore1 > 20) {
          this.score(teamscore1 - 20, 0)
        }
        if (teamscore2 > 20) {
          this.score(teamscore2 - 20, 1)
        }

        this.CurrentScore.forEach(score => {
          if (score.score > 20) {
            this.score(score.score - 20, score.p)
          }
        })

        //clear table
        this.CurrentTable = []
        //reset score
        //generate teamscore
        console.log(this.teamScore)

        this.CurrentScore.forEach(score => score.score = 0)

        let kbir = this.CurrentScore.some(score => {
          return score.push == 2
        })

        if (!kbir) {
          this.deck = this.generateDeck()
          this.Round += 1
          this.distCount = 0
          console.log('regenerated')
        } else {
          this.shouldDistribute = false
          this.Finished = true
          console.log('GAME FINISHED')
          return
        }

      }
      //REDISTRIBUTE 
      this.CurrentPlayers.forEach(player => {
        if (this.gameOfFour && this.distCount > 0) {
          player.setHand = this.deck.slice(0, 3)
          this.deck.splice(0, 3)
        } else {
          player.setHand = this.deck.slice(0, 4)
          this.deck.splice(0, 4)
        }

      })
      this.distCount += 1
      this.LastEater = null
      this.shouldDistribute = false
    }

  }
  //Throw card to the table
  set Throw(ThrownCard) {
    //check if its thrower's turn
    if (this.Turn != this.LastThrower)
      return

    //eat throwen and next
    this.eat(ThrownCard)

    //rmove throwen card from last thrower
    this.CurrentPlayers.forEach((player, index) => {
      if (player.PlayerID == this.LastThrower) {
        player.removeCard(ThrownCard)
      }
    })

    //check if all players run out of cards
    if (this.CurrentPlayers.every(player => player.shouldDistribute() === true)) {
      this.shouldDistribute = true
    }
    //CHECK IF THE GAME SHOULD REDISTRIBUTE CARDS 
    this.distribute()

    //PASS TURN 
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