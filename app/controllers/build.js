import Controller from '@ember/controller';

export default class BuildController extends Controller {
  get downloadAsJSON() {
    const file = new File([JSON.stringify(this.model.nodes)], `build-${this.model.id}.json`, {type: "application/json"});

    return URL.createObjectURL(file);
  }
}
