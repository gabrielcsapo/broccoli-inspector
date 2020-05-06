import EmberRouter from '@ember/routing/router';
import config from './config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function() {
  this.route('index', { path: '/' });
  this.route('dashboard', { path: '/dashboard' });
  this.route('node', { path: '/plugins/:id' }, function() {
    this.route('file', { path: '/file' });
  });
  this.route('search', { path: '/search' });
});
