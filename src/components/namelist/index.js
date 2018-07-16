import React from 'react'

require('./index.less');

class NameList extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    var {nameList} = this.props;
    return (
      <ul className='name-list'>
        <li className='name-list-title'>在线用户:</li>
        {nameList.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
      </ul>
    )
  }
}

export default NameList
