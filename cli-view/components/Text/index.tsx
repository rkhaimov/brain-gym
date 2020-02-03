import { Component } from '../../Component';

export class Text extends Component<{ content: string }> {
  render() {
    return this.props.content;
  }
}
