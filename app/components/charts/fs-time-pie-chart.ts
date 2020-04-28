import Component from "@glimmer/component";
import { bind, later } from "@ember/runloop";
import { action, computed } from "@ember/object";

interface Args {
  fs?: FS
}

export default class NodeInfo extends Component<Args> {
  chart = null;

  title = { text: "Total FS Time" };
  padding = { top: 20 };

  get data() {
    const columns = [];
    const fs = this.args ?.fs || {};

    for (const operation in fs) {
      if (!fs[operation] || !fs[operation].time) continue;
      columns.push([operation, fs[operation].time])
    }

    return {
      columns,
      type: "pie",
      onclick: this.onclick
    }
  }

  get tooltip() {
    return {
      format: {
        value: function (value, ratio, id, index) {
          return `${value / 1000}ms | ${Number(ratio * 100).toFixed(0)}%`;
        }
      }
    };
  }

  get pie() {
    return {
      label: {
        format: function(value, ratio, id) {
          return value;
        }
      }
    }
  }

  @computed
  get onclick() {
    return bind(this, this._click);
  }

  _click(d) {
    console.log(`clicked ${d.name}`);
  }
}
