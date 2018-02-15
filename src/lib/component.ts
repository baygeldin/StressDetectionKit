import { Component } from 'react';
import DeviceKit from 'lib/device-kit';
import Store from 'stores/main';
import Router from 'stores/router';

interface Context { store?: Store, sdk?: DeviceKit, router?: Router }

class ComponentWithContext<A, B> extends Component<Context & A, B> {
  sdk: DeviceKit;

  store: Store;

  router: Router;

  constructor(props: Context & A) {
    super(props);

    this.sdk = this.props.sdk!;
    this.store = this.props.store!;
    this.router = this.props.router!;
  }
}

export default ComponentWithContext;