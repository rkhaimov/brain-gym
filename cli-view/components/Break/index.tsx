import { Component } from '../../Component';
import { ReactConsole } from '../../ReactConsole';
import { Text } from '../Text';

export class Break extends Component {
  render() {
    return <Text content={'\n'}/>;
  }
}
