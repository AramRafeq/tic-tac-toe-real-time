import React from "react";
import ReactDOM from "react-dom";
import Square from './square';

class GameBoard extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      gameState: {
        won:false,
        winner: null,
      },
    }
    this.handleChanges = {
     squareClicked: (row, column, square) => {
        if(!this.state.gameState.won){
          const {board} = this.props;
          board[row][column].available = false;
          const boardUpdate = {
            row,
            column,
          }
          if(this.props.write === 'x'){
            board[row][column].x = true;
            boardUpdate.newData = {available: false, x: true, o:false};
          } else {
            board[row][column].o = true;
            boardUpdate.newData = {available: false, x: false, o:true};
          }
          const gameState = this.recalculateGame(board, this.props.write)
          this.setState({board, gameState}, ()=>{
            try{
              this.props.boardUpdated(boardUpdate, gameState)
            } catch(e) { console.log(e) }
          });
        }
     }
    }
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.boardUpdate && nextProps.boardUpdate.newData){
      const {boardUpdate} = nextProps;
      const {board} = this.props;
      board[boardUpdate.row][boardUpdate.column] = boardUpdate.newData;
      this.setState({board, gameState: nextProps.gameState})
    }
  }

  recalculateGame(board, mode){
    const rowZero = board[0][0][mode] && board[0][1][mode] && board[0][2][mode]; 
    const rowOne = board[1][0][mode] && board[1][1][mode] && board[1][2][mode]; 
    const rowTwo = board[2][0][mode] && board[2][1][mode] && board[2][2][mode];
    if(rowZero || rowOne || rowTwo){
      return {
        won: true,
        winner: mode,
      };
    }

    const columnZero = board[0][0][mode] && board[1][0][mode] && board[2][0][mode]; 
    const columnOne = board[0][1][mode] && board[1][1][mode] && board[2][1][mode]; 
    const columnTwo = board[0][2][mode] && board[1][2][mode] && board[2][2][mode]; 
    if(columnZero || columnOne || columnTwo){
      return {
        won: true,
        winner: mode,
      };
    }

    const diagonal = board[0][0][mode] && board[1][1][mode] && board[2][2][mode]; 
    if(diagonal){
      return {
        won: true,
        winner: mode,
      };
    }

    const reverseDiagonal = board[0][2][mode] && board[1][1][mode] && board[2][0][mode]; 
    if(reverseDiagonal){
      return {
        won: true,
        winner: mode,
      };
    }

    return {
      won: false,
      winner: null,
    };

  }

  render() {
    return (
      <div>
        <div className='header'>
          <h1 >Welcome to realtime tic tac toe</h1>
        </div>        
        <div className='board'>
          {
            (this.props.board).map((row, rowIndex)=>{
              return (
                <div className='row'>
                  {
                    row.map((square, squareIndex) => {
                      return <Square onClick={ () => this.handleChanges.squareClicked(rowIndex, squareIndex, square) } x={square.x} o={square.o} available={square.available && !this.state.gameState.won} />
                    })
                  }
                </div>
              );
            })
          }
        </div>
      </div>
    );
  }
}

export default GameBoard;