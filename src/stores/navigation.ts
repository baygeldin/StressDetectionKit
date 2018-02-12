import remotedev from 'mobx-remotedev';
import { observable, action } from 'mobx';
import { NavigationActions, NavigationRouter } from 'react-navigation';

@remotedev
export default class {
  constructor(public router: NavigationRouter<any, any, any>) {}

  @observable.ref state = this.router.getStateForAction(NavigationActions.init(), null);
  
  @action dispatch (action: any, reset = false) {
    return this.state = this.router.getStateForAction(action, reset ? null : this.state);
  }

  reset() {
    this.dispatch(NavigationActions.init(), true);
  }

  goBack() {
    this.dispatch(NavigationActions.back());
  }

  goTo(route: string) {
    this.dispatch(NavigationActions.navigate({ routeName: route }));
  }

  goToSettings() {
    this.goTo('Settings');
  }
}