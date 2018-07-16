import React from 'react'
import TypeIn from '../typein/index.js'
import MsgShow from '../msgshow/index.js'
import NameList from '../namelist/index.js'
import Nav from '../nav/index.js'
import { connect } from 'react-redux'
import { message_update, guest_update, nickname_get, nickname_forget, enterName } from '../../action'
import { hashHistory } from 'react-router'
require('./index.less');


var mapStateToProps = (state, ownProps) => {
  return {
    nickName: state.nickName,
    nameList: state.nameList,
    msgList: state.msgList,
    enterName: state.enterName,
  }
}

var mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handleClick: function(nickName) {
      fetch('/api/logout', {
        method: 'POST',
        body: nickName,
        credentials: 'include'
      }).then(function(res) {
        if (res.ok) {
          hashHistory.push('/login');
          dispatch(nickname_forget({
            leaveName: nickName
          }));//guest leave
          location.reload();
        }
      });
    },
    handleSubmit: function(value, nickName ,status) {
      dispatch(message_update({
        nickName: nickName,
        msg: value,
      }));
    },
    defaultEnter: function(nickName) {
      dispatch(message_update({
        enterName:nickName,
      }))
    },
  }
}

class ChatAll extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
    this.status = false
  }
  componentDidMount() {
    var { nickName } = this.props
    this.props.defaultEnter(nickName)
  }
  render() {
    const {handleClick, nameList, msgList, nickName, handleSubmit, enterName} = this.props;
    return (
      <div className='chat-wrap'>
        <Nav handleClick={() => handleClick(nickName)} nickName={nickName}/>
        <div className='message-wrap'>
          <NameList nameList={nameList}/>
          <div className='typein-wrap'>
            <MsgShow msgList={msgList} enterName={enterName} nickName={nickName}/>
            <TypeIn handleSubmit={handleSubmit} nickName={nickName}/>
          </div>
        </div>
      </div>
    )
  }

}
var ChatAllContainer = connect(mapStateToProps, mapDispatchToProps)(ChatAll);
export default ChatAllContainer
