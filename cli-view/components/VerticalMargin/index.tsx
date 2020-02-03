import { Component } from '../../Component';
import { ReactConsole } from '../../ReactConsole';
import { Text } from '../Text';

export class VerticalMargin extends Component<{ size: number }> {
  render() {
    return [
      <Text content={'\n'.repeat(this.props.size)}/>,
      this.children,
      <Text content={'\n'.repeat(this.props.size)}/>,
    ];
  }
}
