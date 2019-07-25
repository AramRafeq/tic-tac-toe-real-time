import React from "react";
import ReactDOM from "react-dom";
class Square extends React.Component {
  constructor(props){
    super(props);
    this.state = {

    }
    this.handleChanges = {
     
    }
  }

  render() {
    return (
      <div
        {...this.props}
        className={`square 
                    ${ (this.props.available) ? ' square-pure' : '' }
                    ${ (this.props.x) ? ' square-player-x' : '' }
                    ${ (this.props.o) ? ' square-player-y' : '' }
                  `}>

      </div>
    );
  }
}

export default Square;