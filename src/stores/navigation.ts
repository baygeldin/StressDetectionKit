// import remotedev from 'mobx-remotedev';
// import { observable, action } from 'mobx';
// import { NavigationActions, NavigationRouter } from 'react-navigation';


// let initRoute = NavigationActions.navigate({ routeName: 'Home' })

// @remotedev
// class Navigation {
//   router: NavigationRouter<any, any, any>;

//   @observable.ref state = this.router.getStateForAction(initRoute, null);
  
//   @action dispatch = (action: any) => {
//     return this.state = this.router.getStateForAction(action, this.state);
//   }

//   reset() {
//     this.dispatch(NavigationActions.reset({ index: 0, actions: [initRoute] }));
//   }

//   goBack() {
//     this.dispatch(NavigationActions.back());
//   }

//   goTo(route: string) {
//     this.dispatch(NavigationActions.navigate({ routeName: route }));
//   }
// }

// export default new Navigation();