import { IComponent, ProcessedElement, RenderReturnType } from './ReactConsole';

export class ConsoleDOM {
  static render(root: ProcessedElement) {
    ConsoleDOM.root = root;
    ConsoleDOM.storeElementCreateInstanceRunHooks(root, ConsoleDOM.root.name);

    ConsoleDOM.paint();
  }

  private static instances: NodesList = {};
  private static root: ProcessedElement;

  private static paint() {
    const message = ConsoleDOM.reduceToMessageDeep(ConsoleDOM.root);

    // tslint:disable-next-line:no-console
    console.clear();
    process.stdout.write(message);
  }

  private static reduceToMessageDeep(element: RenderReturnType, parent = ''): string {
    if (typeof element === 'string') {
      return element;
    }

    if (Array.isArray(element)) {
      return (element as Array<ProcessedElement | RenderReturnType>)
        .map(item => ConsoleDOM.reduceToMessageDeep(item, parent))
        .join('');
    }

    const key = ConsoleDOM.getKeyFrom(element.name, parent);
    const { instance } = ConsoleDOM.getAndSetPropsOrCreateElement(element, key);

    return ConsoleDOM.reduceToMessageDeep(instance.render(), key);
  }

  private static getAndSetPropsOrCreateElement(element: ProcessedElement, key: string) {
    const hashed = ConsoleDOM.instances[key];

    if (hashed !== undefined) {
      hashed.instance.setProps(element.props);

      return hashed;
    }

    return ConsoleDOM.storeElementCreateInstanceRunHooks(element, key);
  }

  private static storeElementCreateInstanceRunHooks(element: ProcessedElement, key: string): HashedElement {
    const hashed = {
      ...element,
      instance: element.create(ConsoleDOM.paint),
    };

    ConsoleDOM.instances[key] = hashed;
    hashed.instance.setProps(element.props);
    hashed.instance.componentDidMount();

    return hashed;
  }

  private static getKeyFrom(elementName: string, parent: string) {
    if (parent.length === 0) {
      return elementName;
    }

    return `${parent}->${elementName}`;
  }
}

type HashedElement = ProcessedElement & { instance: IComponent };
type NodesList = Record<string, (HashedElement) | undefined>;
