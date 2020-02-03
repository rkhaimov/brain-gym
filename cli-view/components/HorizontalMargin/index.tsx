import { Component } from '../../Component';
import { ProcessedElement, ReactConsole, RenderReturnType } from '../../ReactConsole';
import { Text } from '../Text';

export class HorizontalMargin extends Component<{ size: number }> {
  render() {
    return ReactConsole.Children.map(this.children, this.prependSpaces);
  }

  private prependSpaces = (child: ProcessedElement): RenderReturnType => {
    return [<Text content={' '.repeat(this.props.size)}/>, child];
  }
}
