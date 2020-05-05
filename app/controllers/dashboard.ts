import Controller from '@ember/controller';

export default class DashboardController extends Controller {
  get info() {
    const { systemInfo } = this.model;

    const { cpus, env, totalmem, type } = systemInfo;

    return {
      header: [
        'Cpus',
        'Memory',
        'Type',
        'ENV'
      ],
      body: [
        [cpus, totalmem, type, {
          tag: 'pre',
          text: env,
        }]
      ]
    }
  }

  get fs() {
    const { totalFs: fs } = this.model;

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
        return [key, `${time / 1000000}ms`, count];
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
}
