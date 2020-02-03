import { IComponent, ProcessedElement, RenderReturnType } from './ReactConsole';

export class Component<TProps = {}, TState = {}> implements IComponent {
  protected state!: TState;

  constructor(protected props: TProps & WithChildren, private update: () => unknown) {}

  get children(): ProcessedElement[] {
    return this.props.children || [];
  }

  // tslint:disable-next-line:no-empty
  componentDidMount() {}

  setState(state: Partial<TState>) {
    this.state = { ...this.state, ...state };

    this.update();
  }

  setProps(props: Record<string, unknown>) {
    this.props = props as TProps;
  }

  render(): RenderReturnType {
    throw new Error('Not implemented');
  }
}

type WithChildren = Partial<{ children: ProcessedElement[] }>;
