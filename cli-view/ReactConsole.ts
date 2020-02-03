export class ReactConsole {
  static Children = {
    map(children: ProcessedElement[], clb: (child: ProcessedElement) => RenderReturnType) {
      return children.map(child => clb(child));
    },
  };

  static createElement(
    Element: new (props: Record<string, unknown>, update: () => unknown) => IComponent,
    props: Record<string, unknown>,
    ...children: Children
  ): ProcessedElement {
    const prepared = ReactConsole.toChildProps(props, ReactConsole.flattenChildren(children));

    return {
      name: Element.name,
      props: prepared,
      create: update => new Element(prepared, update),
    };
  }

  private static toChildProps(props: Record<string, unknown>, children: ProcessedElement[]): Record<string, unknown> {
    return { ...props, children };
  }

  private static flattenChildren(children: Children): ProcessedElement[] {
    return (children as ProcessedElement[]).reduce((accumulated, child) => {
      if (Array.isArray(child)) {
        return [...accumulated, ...ReactConsole.flattenChildren(child)];
      }

      accumulated.push(child);

      return accumulated;
    }, [] as ProcessedElement[]);
  }
}

export interface IComponent {
  componentDidMount(): void;
  setProps(props: Record<string, unknown>): unknown;
  render(): RenderReturnType;
}

// tslint:disable-next-line:interface-over-type-literal
export type ProcessedElement = {
  name: string;
  props: Record<string, unknown>;
  create(update: () => unknown): IComponent;
};

export type RenderReturnType = ProcessedElement | ProcessedElement[] | string | RenderReturnType[];

type Children = ProcessedElement[] | Children[];
