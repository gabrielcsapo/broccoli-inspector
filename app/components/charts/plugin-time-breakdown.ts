import Component from "@glimmer/component";
import { bind, later } from "@ember/runloop";
import { action, computed } from "@ember/object";

interface Args {
  fs?: FS;
  selfTime: Number;
}

export default class NodeTimeBreakdown extends Component<Args> {
  chart = null;

  title = { text: "Node Time Breakdown" };
  padding = { top: 20 };

  get data() {
    const columns = [];
    const fs = this.args?.fs || {};
    const selfTime = this.args.selfTime;

    let fsTime = 0;

    for (const operation in fs) {
      if (!fs[operation] || !fs[operation].time) continue;
      fsTime += fs[operation].time;
    }

    return {
      columns: [
        ["FS", fsTime / 1000000],
        ["Other", selfTime - (fsTime / 1000000)]
      ],
      type: "pie",
      onclick: this.onclick
    }
  }

  get tooltip() {
    return {
      format: {
        value: function (value, ratio, id, index) {
          return `${value}ms | ${Number(ratio * 100).toFixed(0)}%`;
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
