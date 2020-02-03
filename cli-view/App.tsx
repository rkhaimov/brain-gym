import { Component } from './Component';
import { IInputPayload, Input, IOnInputEnd } from './components/Input';
import { Text } from './components/Text';
import { ReactConsole } from './ReactConsole';

type State =
  { finished: false; payload: {} } |
  { finished: true; payload: IInputPayload<typeof App.inputs> };

export class App extends Component<{}, State> {
  static inputs = [
    { field: 'name', label: 'Enter your name' },
    { field: 'age', label: 'Enter your age' },
  ] as const;

  state: State = {
    finished: false,
    payload: {},
  };

  render() {
    if (this.state.finished) {
      return <Text content={`Hello ${this.state.payload.name}. I know that you are ${this.state.payload.age} years old`} />;
    }

    return <Input inputs={App.inputs} onInputEnd={this.finish} />;
  }

  private finish: IOnInputEnd<typeof App.inputs> = data => {
    this.setState({ finished: true, payload: data });
  }
}
