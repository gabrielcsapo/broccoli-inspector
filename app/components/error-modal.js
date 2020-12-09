import Component from "@glimmer/component";

export default class ErrorModal extends Component {
  constructor(...args) {
    super(...args);
  }

  scrollToError() {
    document.querySelector('.error-message-block').scroll(0, parseInt(document.querySelector('.line-highlight').style.top.replace('px', '')))
  }
}
