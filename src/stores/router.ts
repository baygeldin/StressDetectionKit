import remotedev from 'mobx-remotedev';
import { observable, action } from 'mobx';
import { NavigationActions, NavigationRouter } from 'react-navigation';

//@remotedev
export default class Router {
  constructor(public router: NavigationRouter<any, any, any>) {}

  @observable.ref
  state = this.router.getStateForAction(NavigationActions.init(), null);

  @action.bound
  dispatch(action: any, reset = false) {
    this.state = this.router.getStateForAction(
      action,
      reset ? null : this.state
    );
    return this.state;
  }

  @action.bound
  reset() {
    this.dispatch(NavigationActions.init(), true);
  }

  @action.bound
  goBack() {
    this.dispatch(NavigationActions.back());
  }

  @action.bound
  goTo(route: string) {
    this.dispatch(NavigationActions.navigate({ routeName: route }));
  }

  @action.bound
  goToSettings() {
    this.goTo('Settings');
  }
}
