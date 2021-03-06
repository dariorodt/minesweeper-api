import React from 'react';
import ReactDOM from 'react-dom';
import Axios from 'axios';

class Grid extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            time: 0,
            id: 0,

        };

        this.saveGame = this.saveGame.bind(this);
        this.createGame = this.createGame.bind(this);
        this.openGame = this.openGame.bind(this);
        this.listGames = this.listGames.bind(this);
    }

    width = 10;
    cells = 0;
    bombAmount = 0;
    squares = [];
    isGameOver = false;
    flags = 0;
    status = ""
    seconds = 0;
    timer;

    saveGame() {
        let myGrid = [], status = "active", elapsed_time = this.seconds;
        this.squares.forEach(it => {
            myGrid.push(it.classList.value);
        })
        Axios.put("http://localhost:8000/api/games/update/"+this.state.id, {
            grid: myGrid,
            elapsed_time: elapsed_time,
            status: status
        }).then(resp => {
            console.log(resp);
        }).catch(error => {
            console.log(error);
        });
        let grid = document.querySelector('.grid');
        grid.innerHTML = "";
        this.cells = 0;
        this.bombAmount = 0;
        this.squares = [];
        this.status = "";
        this.seconds = 0;
        this.flags = 0;
        document.querySelector('#newGameBtn').removeAttribute('disabled');
        document.querySelector('#newGameBtn').removeAttribute('disabled');
        clearInterval(this.timer);
        this.setState({time: 0, id: 0});
        this.listGames();
    }

    createGame() {
        let bombAmount = prompt("Enter bomb amount (max 50)");
        if (Number(bombAmount) > 50) { alert("Bomb amount should be less than 50"); return; }
        Axios.post("http://localhost:8000/api/games/create", {
            "width": 10,
            "bombAmount": bombAmount
        }).then(resp => {
            this.width = resp.data.width;
            this.cells = resp.data.width * resp.data.width;
            this.bombAmount = resp.data.bomb_amount;
            this.status = resp.data.status;
            this.setState({time: resp.data.elapsed_time});
            this.setState({id: resp.data.id});
            this.createBoard(JSON.parse(resp.data.grid));
            document.querySelector('#newGameBtn').setAttribute('disabled', 'disabled');
            console.log("Bomb amount: " + this.bombAmount);
        }).catch((error) => {
            console.log(error);
        });
    }

    openGame(game) {
        console.log("opening game: " + game);
        Axios.get('http://localhost:8000/api/games/'+game).then(resp => {
            console.log(resp.data);
            this.width = resp.data.width;
            this.cells = resp.data.width * resp.data.width;
            this.bombAmount = resp.data.bomb_amount;
            this.status = resp.data.status;
            this.seconds = resp.data.elapsed_time;
            this.setState({time: resp.data.elapsed_time});
            this.setState({id: resp.data.id});
            this.createBoard(JSON.parse(resp.data.grid));
            console.log("Bomb amount: " + this.bombAmount);
        }).catch(error => {
            console.log(error);
        });
    }

    listGames() {
        let tableList = document.querySelector('#tableList');
        Axios.get('http://localhost:8000/api/games').then(resp => {
            //console.log(resp.data);
            const data = resp.data;
            for(let i = 0; i < data.length; i++) {
                const row = document.createElement('tr');
                // Id, Bombs, Status, Seconds
                row.innerHTML =
                    "<td>"+data[i].id+"</tr>"+
                    "<td>"+data[i].bomb_amount+"</tr>"+
                    "<td>"+data[i].status+"</tr>"+
                    "<td>"+data[i].elapsed_time+"</tr>";
                row.addEventListener('click', (e) => {
                    this.openGame(data[i].id);
                });
                tableList.appendChild(row);
            }
        }).catch(error => {
            console.log(error);
        })
    }

    createBoard(shuffledArray) {
        let grid = document.querySelector('.grid');
        console.log(shuffledArray);

        //
        for (let i = 0; i < this.cells; i++) {
            const square = document.createElement('div');
            square.setAttribute('id', i.toString());
            square.classList.add(shuffledArray[i]);
            grid.appendChild(square);
            this.squares.push(square);
            //normal click
            square.addEventListener('click', (e) => {
                this.click(square);
            });

            //cntrl and left click
            square.oncontextmenu = (e) => {
                e.preventDefault();
                this.addFlag(square);
            }
        }

        for (let i = 0; i < this.squares.length; i++) {
            let total = 0;
            const isInLeft = i % this.width === 0;
            const isInRight = i % this.width === this.width - 1;

            if (this.squares[i].classList.contains('valid')) {
                if (i >= 0 && !isInLeft && this.squares[i - 1].classList.contains('bomb')) total++;
                if (i >= 9 && !isInRight && this.squares[i + 1 - this.width].classList.contains('bomb')) total++;
                if (i >= 10 && this.squares[i - this.width].classList.contains('bomb')) total++;
                if (i >= 11 && !isInLeft && this.squares[i - 1 - this.width].classList.contains('bomb')) total++;
                if (i <= 98 && !isInRight && this.squares[i + 1].classList.contains('bomb')) total++;
                if (i <= 90 && !isInLeft && this.squares[i - 1 + this.width].classList.contains('bomb')) total++;
                if (i <= 88 && !isInRight && this.squares[i + 1 + this.width].classList.contains('bomb')) total++;//*
                if (i <= 89 && this.squares[i + this.width].classList.contains('bomb')) total++;//*
                this.squares[i].setAttribute('data', total);
            }
        }

        this.timer = setInterval(() => {
            this.setState({time: this.seconds++});
        }, 1000);
    }

    click(square) {
        console.log("Square clicked!")
        let currentId = square.id;
        if (this.isGameOver) return;
        if (square.classList.contains('checked') || square.classList.contains('flag')) return;
        if (square.classList.contains('bomb')) {
            this.gameOver(square);
        } else {
            let total = square.getAttribute('data');
            if (total != 0) {
                square.classList.add('checked');
                if (total == 1) square.classList.add('one');
                if (total == 2) square.classList.add('two');
                if (total == 3) square.classList.add('three');
                if (total == 4) square.classList.add('four');
                square.innerHTML = total;
                return;
            }
            this.checkSquare(square, currentId);
        }
        square.classList.add('checked');
    }

    checkSquare(square, currentId) {
        console.log("Check. Current id: " + currentId);
        const inLeft = currentId % this.width === 0;
        const inRight = currentId % this.width === this.width - 1;
        if (inRight) console.log("In right edge...");
        if (inLeft) console.log("In left edge...");

        setTimeout(() => {
            if (currentId >= 0 && !inLeft) {
                const newId = this.squares[parseInt(currentId) - 1].id;
                console.log("Next id is: " + newId);
                const newSquare = document.getElementById(newId);
                this.click(newSquare);
            }
            if (currentId >= 9 && !inRight) {
                const newId = this.squares[parseInt(currentId) + 1 - this.width].id;
                console.log("Next id is: " + newId);
                const newSquare = document.getElementById(newId);
                this.click(newSquare);
            }
            if (currentId >= 10) {
                const newId = this.squares[parseInt(currentId) - this.width].id;
                console.log("Next id is: " + newId);
                const newSquare = document.getElementById(newId);
                this.click(newSquare);
            }
            if (currentId >= 11 && !inLeft) {
                const newId = this.squares[parseInt(currentId) - 1 - this.width].id;
                console.log("Next id is: " + newId);
                const newSquare = document.getElementById(newId);
                this.click(newSquare);
            }
            if (currentId <= 98 && !inRight) {
                const newId = this.squares[parseInt(currentId) + 1].id;
                console.log("Next id is: " + newId);
                const newSquare = document.getElementById(newId);
                this.click(newSquare);
            }
            if (currentId <= 90 && !inLeft) {
                const newId = this.squares[parseInt(currentId) - 1 + this.width].id;
                console.log("Next id is: " + newId);
                const newSquare = document.getElementById(newId);
                this.click(newSquare);
            }
            if (currentId <= 88 && !inRight) {
                const newId = this.squares[parseInt(currentId) + 1 + this.width].id;
                console.log("Next id is: " + newId);
                const newSquare = document.getElementById(newId);
                this.click(newSquare);
            }
            if (currentId <= 89) {
                const newId = this.squares[parseInt(currentId) + this.width].id;
                console.log("Next id is: " + newId);
                const newSquare = document.getElementById(newId);
                this.click(newSquare);
            }
        }, 10);
    }

    gameOver(square) {
        // result.innerHTML = 'BOOM! Game Over!'
        this.isGameOver = true;

        //show ALL the bombs
        this.squares.forEach(square => {
          if (square.classList.contains('bomb')) {
            square.innerHTML = '????';
            square.classList.remove('bomb');
            square.classList.add('checked');
          }
        })
    }

    checkForWin() {
        ///simplified win argument
        let matches = 0;
        const result = document.getElementById('result');

        for (let i = 0; i < this.squares.length; i++) {
            if (this.squares[i].classList.contains('flag') && this.squares[i].classList.contains('bomb')) {
              matches ++;
            }
            if (matches === this.bombAmount) {
                result.innerHTML = 'YOU WIN!';
                this.isGameOver = true;
            }
        }
    }

    addFlag(square) {
        if (this.isGameOver) return;
        if (!square.classList.contains('checked') && (this.flags < this.bombAmount)) {
          if (!square.classList.contains('flag')) {
            square.classList.add('flag');
            square.innerHTML = ' ????';
            this.flags ++;
            document.getElementById('flagsLeft').innerHTML =
            "Remaining flags: " + (this.bombAmount - this.flags).toString();
            this.checkForWin();
        } else {
            square.classList.remove('flag');
            square.innerHTML = '';
            this.flags--;
            document.getElementById('flagsLeft').innerHTML =
                "Remaining flags: " + (this.bombAmount - this.flags).toString();
          }
        }
      }

    componentDidMount() {
        //this.createBoard();
        this.listGames();
    }

    render() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-lg-12"></div>
                </div>
                <div className="row">
                    <div className="col-lg-12">
                        <div className="grid"></div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-lg-12">
                        <span id="result"></span>
                        <span className="my-auto" id="flagsLeft">Remaining flags: {this.bombAmount}</span>
                        <span className="float-right">Ellapsed time: {this.state.time.toString()}</span>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <button id="newGameBtn" className="btn btn-primary" onClick={this.createGame}>New game</button>
                        <button id="saveGameBtn" className="btn btn-primary ml-1" onClick={this.saveGame}>Save game</button>
                        <a className="btn btn-info float-right" href="/home">Go to Home Page</a>
                    </div>
                </div>
                <div className="row mt-2">
                    <div className="col-lg-12">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>Id</th>
                                    <th>Bombs</th>
                                    <th>Status</th>
                                    <th>Seconds</th>
                                </tr>
                            </thead>
                            <tbody id="tableList">
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}

export default Grid;

if (document.getElementById('example')) {
    ReactDOM.render(<Grid />, document.getElementById('example'));
}
