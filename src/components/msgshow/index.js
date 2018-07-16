import React from 'react'

require('./index.less');

class MsgShow extends React.Component {
  componentDidUpdate(prevProps) {//信息自动下滑 scrollTop 滚动条滚动的距离
    if (prevProps.msgList !== this.props.msgList) {
      var t = this.refs.myDiv;
      t.scrollTop = t.scrollHeight - t.offsetHeight;
    }
  }
  chat() {
    var { msgList, enterName, nickName } = this.props;
    console.log(msgList)
    return msgList.map((item, index) => {
      if(item.enterName) {//加入群聊
        return  (
          <span className='msg-show_welcome' key={`${Math.random() * 100000}`}>
            {`${item.enterName}加入群聊`}
          </span>)
      }
      if(item.msg && item.nickName !== nickName) {//别人发送消息 左边
        return  (
          <li key={`${Math.random() * 100000}`} className='msg-show_li-left'>
            <div className='msg-show_content-left'>
              <span className='msg-show_name-left'>
                {item.nickName}:
              </span>
              <div className='msg-show_msg-left' dangerouslySetInnerHTML={{ __html: item.msg}}/>
            </div>
          </li>)
      }
      if(item.msg && item.nickName === nickName) {//自己发送的信息 右边
        return  (
          <li key={`${Math.random() * 100000}`} className='msg-show_li-right'>
            <div className='msg-show_content'>
              <div className='msg-show_name-right'>
                <span>
                  {item.nickName}:
                </span>
              </div>
              <div className='msg-show_msg-right' dangerouslySetInnerHTML={{ __html: item.msg}}/>
            </div>
          </li>)
      }
      if (item.leaveName) {//退出群聊
        return (
          <span className='msg-show_welcome' key={`${Math.random() * 100000}`}>
            {`${item.leaveName}已退出群聊`}
          </span>)
      }
    })
  }
  render() {
    var { msgList, enterName } = this.props;
    function EnterName(props) {
      if (!!props.msgList) {
        return <span className='msg-show_welcome'>{`${props.enterName}加入群聊`}</span>
      }
    }
    return (
      <div ref='myDiv' className='msg-show'>
        <h5>群聊</h5>
        <ul>
          {this.chat()}
        </ul>
      </div>
    )
  }
}

export default MsgShow
