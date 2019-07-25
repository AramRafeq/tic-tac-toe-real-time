import React from "react";
import ReactDOM from "react-dom";
import io from 'socket.io-client';
import './resources/style.css'
import GameBoard from './components/gameBoard';

const options  = {
  transports:['websocket'],
}
const socket = io.connect('http://localhost:3000', options);

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      connectedClients: 0,
      playersInMatch: 0,
      connectedTo: null,
      write: null,
      boardUpdate: {},
      board: this.initialBoard(),
      gameState: {
        won: false,
        winner: null,
      }
    }
    this.handleChanges = {
      newGame: () => {
        this.setState({
          connectedTo: null,
          write: null,
          board: this.initialBoard(),
          gameState: {
            won: false,
            winner: null,
          },
        }, () =>{
          socket.emit('newGame', socket.id)
        })
        
      },
      leaveGame: () => {
        this.setState({
          connectedTo: null,
          write: null,
          gameState: {
            won: false,
            winner: null,
          },
        }, () =>{
          socket.emit('leaveGame', socket.id)
        })
      },
      rematch: () => {
        this.setState({
          board: this.initialBoard(),
          gameState: {
            won: false,
            winner: null,
          },
        }, () =>{
          socket.emit('rematchGame', socket.id)
        })
      },
      boardUpdated: (updatedData, gameState) => {
        socket.emit('gameBoardUpdate', updatedData);
        if(gameState.won){
          this.setState({gameState})
          socket.emit('gameWon', gameState);
        }
      }
    }
  }
  componentDidMount(){
    socket.on('clientCount', (count)=>{
      this.setState({connectedClients: count});
    })
    socket.on('playersInMatchCount', (response)=>{
      this.setState({playersInMatch: response});
    })

    socket.on('newGameResponse', (response)=>{
      this.setState({connectedTo: response.id, write: response.write });
    })
    socket.on('oponentLeft', (response)=>{
      this.setState({connectedTo: null});
    })
    socket.on('gameBoardUpdate', (details)=>{
      this.setState({boardUpdate: details});
    })
    socket.on('gameWon', (gameState)=>{
      this.setState({gameState});
    })
  }
  initialBoard(){
    return [
      [
        {x: false, o: false, available: true},
        {x: false, o: false, available: true},
        {x: false, o: false, available: true},
      ],
      [
        {x: false, o: false, available: true},
        {x: false, o: false, available: true},
        {x: false, o: false, available: true},
      ],
      [
        {x: false, o: false, available: true},
        {x: false, o: false, available: true},
        {x: false, o: false, available: true},
      ],
    ];
  }
  render() {
    return (
      <div>
        <p>Connected Clients: {this.state.connectedClients}</p>
        <p>Players In Match : {this.state.playersInMatch}</p>
        <p>My ID: {socket.id}</p>
        <p>Connected To: {(this.state.connectedTo === -1 ) ? '😞 no player found': this.state.connectedTo}</p>
        {
          (this.state.connectedTo !== -1 && this.state.connectedTo !== null)
          ? (
            <div>
              <GameBoard board={this.state.board} write={this.state.write} gameState={this.state.gameState} boardUpdated={this.handleChanges.boardUpdated} boardUpdate={this.state.boardUpdate} />
              {
                (this.state.gameState.won)
                ? <p>Winner Is {this.state.gameState.winner}</p>
                : null
              }
              <button onClick={this.handleChanges.leaveGame}>Leave Game</button>
            </div>
          )
          : <button onClick={this.handleChanges.newGame}>Search For Player</button>
        }
      </div> 
    );
  }
}

var mountNode = document.getElementById("app");
ReactDOM.render(<App />, mountNode);