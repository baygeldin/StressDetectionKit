import { action, observable } from 'mobx';
import { NavigationActions, NavigationRouter } from 'react-navigation';

export default class Router {
  @observable.ref
  public state = this.router.getStateForAction(NavigationActions.init(), null);

  constructor(public router: NavigationRouter<any, any, any>) {}

  @action.bound
  public dispatch(actionObject: any, reset = false) {
    this.state = this.router.getStateForAction(
      actionObject,
      reset ? null : this.state
    );
    return this.state;
  }

  @action.bound
  public reset() {
    this.dispatch(NavigationActions.init(), true);
  }

  @action.bound
  public goBack() {
    this.dispatch(NavigationActions.back());
  }

  @action.bound
  public goTo(route: string) {
    this.dispatch(NavigationActions.navigate({ routeName: route }));
  }

  @action.bound
  public goToSettings() {
    this.goTo('Settings');
  }

  @action.bound
  public goToDeveloperScreen() {
    this.goTo('Developer');
  }
}
