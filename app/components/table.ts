import Component from "@glimmer/component";

interface Data {
  header?: string[];
  body?: string[];
}

interface Args {
  data?: Data;
  title?: string;
  empty?: string;
}

export default class Table extends Component<Args> {}
