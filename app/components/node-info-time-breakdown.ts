import Component from "@glimmer/component";
import { bind, later } from "@ember/runloop";
import { action, computed } from "@ember/object";
import { tracked } from '@glimmer/tracking';

interface Args {
  fs?: FS;
  selfTime: Number;
}

export default class NodeInfoTimeBreakdown extends Component<Args> {
  chart = null;

  title = { text: "" };
  padding = { top: 20 };

  @tracked
  selectedTab = 0;

  get fs() {
    const fs = this.args?.fs

    const body = Object.keys(fs)
      .filter((key) => {
        const item = fs[key];

        return item && item.time;
      })
      .sort((keyA, keyB) => {
        const rowA = fs[keyA];
        const rowB = fs[keyB];

        return rowB.time - rowA.time;
      })
      .map((key) => {
        const { time, count } = fs[key];
        // time is ns and we want to convert to ms
        return [key, { raw: time, text: `${time / 1000000}ms` }, count];
      });

    return {
      header: [
        `Operation`,
        `Time`,
        `Count`
      ],
      body
    }
  }

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
}
