import React from 'react';
import ReactDOM from 'react-dom';

class Grid extends React.Component {
    width = 10;
    cells = this.width * this.width;
    squares = [];
    bombAmount = 12;
    isGameOver = false;
    flags = 0;

    constructor(props) {
        super(props);
    }


    createBoard() {
        let grid = document.querySelector('.grid');

        const bombsArray = Array(this.bombAmount).fill('bomb');
        const emptyArray = Array(this.cells - this.bombAmount).fill('valid');
        const gameArray = emptyArray.concat(bombsArray);
        const firstPass = gameArray.sort(() => Math.random() -0.5);
        const secondPass = firstPass.sort(() => Math.random() - 0.5);
        const shuffledArray = secondPass.sort(() => Math.random() - 0.5);
        console.log(shuffledArray);

        for (let i = 0; i < this.cells; i++) {
            const square = document.createElement('div');
            square.setAttribute('id', i.toString());
            square.classList.add(shuffledArray[i]);
            grid.appendChild(square);
            this.squares.push(square);
            //normal click
            square.addEventListener('click', (e) => {
                e.preventDefault();
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
    }

    click(square) {
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
        const inLeft = currentId % this.width === 0;
        const inRight = currentId % this.width === this.width - 1;
        console.log("Check. Current id: " + currentId);
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
            square.innerHTML = '💣';
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
            square.innerHTML = ' 🚩';
            this.flags ++;
            document.getElementById('flagsLeft').innerHTML = (this.bombAmount - this.flags).toString();
            this.checkForWin();
        } else {
            square.classList.remove('flag');
            square.innerHTML = '';
            this.flags--;
            document.getElementById('flagsLeft').innerHTML = (this.bombAmount - this.flags).toString();
          }
        }
      }

    componentDidMount() {
        this.createBoard();
    }

    render() {
        return (
            <div>
                <div className="grid"></div>
                <div id="result"></div>
                <div id="flagsLeft"></div>
            </div>
        );
    }
}

export default Grid;

if (document.getElementById('example')) {
    ReactDOM.render(<Grid />, document.getElementById('example'));
}
