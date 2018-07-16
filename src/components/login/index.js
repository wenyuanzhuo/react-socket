import React from 'react'
// import { hashHistory } from 'react-router'

import { connect } from 'react-redux'
import { message_update, guest_update, nickname_get } from '../../action'
import { hashHistory } from 'react-router'
require('./index.less');

function mapStateToProps(state, ownProps) {
  return {
    nickName: state.nickName
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    handleClick: function(e) {
      var nickname = this.refs.nick.value;
      fetch('/api/nickname', {
        method: 'POST',
        body: nickname,
        credentials: 'include'
      }).then(function(res) {
        return res.json();
      }).then(function(data) {
        if (data.legal == 'yes') {
          dispatch(nickname_get(nickname));
          hashHistory.push('/');
        } else if (data.legal == 'repeat') {
          alert('昵称已被占用,请重新选择昵称！');
        }
      })
    }
  }
}


class Login extends React.Component {
  constructor(props) {
    super(props);
    this.keypress = this.keypress.bind(this)
    this.keydown = this.keydown.bind(this)
    this.keyup = this.keyup.bind(this)
    this.handleClick = this.props.handleClick.bind(this)
  }
  keypress(e){
    if (e.keyCode === 13) {
      e.preventDefault();
    }
  }
  keydown(e){
    if (e.keyCode === 13) {
      e.preventDefault();
      this.handleClick()
    }
  }
  keyup(e){
    if (e.keyCode === 13) {
      e.preventDefault();
    }
  }
  render() {
    return (
      <div className='nick-name'>
      <h2>起一个昵称吧！</h2>
      <input ref='nick' onKeyPress={this.keypress} onKeyDown={this.keydown} onKeyUp={this.keyup}/><button onClick={this.handleClick}>确定</button>
    </div>
    )
  }

}

var LoginContainer = connect(mapStateToProps, mapDispatchToProps)(Login);

export default LoginContainer
