import Component from "@glimmer/component";

interface Args {
  header?: string[];
  body?: string[];
  title?: string;
}

export default class Table extends Component<Args> {}
