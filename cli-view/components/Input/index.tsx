import { Component } from '../../Component';
import { ProcessedElement, ReactConsole } from '../../ReactConsole';
import { Break } from '../Break';
import { Text } from '../Text';

type State = Record<string, string>;

interface IProps<TFields extends string> {
  inputs: ReadonlyArray<{ field: TFields; label: string }>;
  onInputEnd: IOnInputEnd<IProps<TFields>['inputs']>;
}

type InferFields<TInputs> = TInputs extends ReadonlyArray<{ field: infer TFields; label: string }>
  ? TFields extends string
    ? TFields
    : never
  : never;

export type IOnInputEnd<TInputs> = (data: IInputPayload<TInputs>) => void;

export type IInputPayload<TInputs> = Record<InferFields<TInputs>, string>;

export class Input<TFields extends string> extends Component<IProps<TFields>, State> {
  state = {} as State;

  componentDidMount() {
    process.stdin.on('data', data => {
      const input = this.getCurrentField();

      if (input === undefined) {
        this.props.onInputEnd(this.state);

        return;
      }

      const entered = data.toString().slice(0, -2);

      this.setState({[input.field]: entered});
    });
  }

  render() {
    const input = this.getCurrentField();

    if (input === undefined) {
      return this.renderFilledFields();
    }

    return [
      ...this.renderFilledFields(),
      <Text content={`${input.label}: `}/>,
    ];
  }

  private renderFilledFields() {
    return this.props.inputs.reduce<ProcessedElement[][]>((accumulated, input) => {
      const value = this.getInputValue(input);

      if (value === undefined) {
        return accumulated;
      }

      accumulated.push([<Text content={`${input.label}: ${value}`}/>, <Break/>]);

      return accumulated;
    }, []);
  }

  private getCurrentField() {
    return this.props.inputs.find(input => this.getInputValue(input) === undefined);
  }

  private getInputValue(input: IProps<TFields>['inputs'][number]) {
    return this.state[input.field];
  }
}
