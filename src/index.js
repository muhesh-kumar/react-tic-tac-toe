import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

class Square extends React.Component {
  render() {
    return (
      <button
        className="square"
        onClick={this.props.onClick}
        style={
          this.props.isWinningSquare
            ? {
                backgroundColor: 'yellowgreen',
              }
            : null
        }
      >
        {this.props.value}
      </button>
    );
  }
}

class Board extends React.Component {
  renderSquare(i) {
    console.log('Row num: ', i);
    return (
      <Square
        value={this.props.squares[i]}
        isWinningSquare={
          this.props.winningSquareIndices.find((e) => e === i) !== undefined
        }
        onClick={() => this.props.onClick(i)} // here onClick is a prop and not an event handler
      />
    );
  }

  renderRow(rowNum) {
    const cols = [];
    for (let i = 0; i < 3; i++) {
      cols.push(this.renderSquare(3 * rowNum + i));
    }
    return <div className="board-row">{cols}</div>;
  }

  render() {
    const rows = [];
    for (let i = 0; i < 3; i++) {
      rows.push(this.renderRow(i));
    }
    return <div>{rows}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.winningSquareIndices = [];
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
          currentMove: {
            x: null,
            y: null,
          },
        },
      ],
      reverseMoves: false,
      stepNumber: 0,
      xIsNext: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1]; // current state of the game
    const squares = current.squares.slice();

    // return early if someone has won or if square[i] is already filled
    if (calculateWinner(squares) || squares[i]) {
      return;
    }

    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([
        {
          squares: squares,
          currentMove: {
            x: Math.floor(i / 3),
            y: i % 3,
          },
        },
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
      // since the history state variable is not set here it will be merged with the previous state
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber]; // current state of the game
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      // step is history and move is history's index
      const desc = move
        ? `Go to move #${move} at location : (${step.currentMove.x}, ${step.currentMove.y})`
        : 'Go to game start';
      return (
        <li key={move}>
          <button
            onClick={() => this.jumpTo(move)}
            style={
              move === history.length - 1
                ? {
                    fontWeight: 'bold',
                  }
                : null
            }
          >
            {desc}
          </button>
        </li>
      );
    });

    if (this.state.reverseMoves) {
      moves.reverse();
    }

    let status;
    if (winner) {
      status = 'Winner: ' + current.squares[winner[0]];

      // Re render the winning squares
      this.winningSquareIndices = winner;
    } else {
      // Reset the winning square indices to be empty else it will highlight the winning indices even when we time travel to go back in the history to a non-winning state
      this.winningSquareIndices = [];

      if (current.squares.find((e) => e === null) !== undefined)
        status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
      else status = 'Game Drawn';
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            winningSquareIndices={this.winningSquareIndices}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div>
            <button
              onClick={
                () =>
                  // flip the order when toggle button is clicked
                  this.setState({ reverseMoves: !this.state.reverseMoves })
                // NOTE: invoking the this.setState() method will cause a re-render of the component
              }
            >
              Toggle Order
            </button>
          </div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Game />);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return lines[i];
    }
  }
  return null;
}
