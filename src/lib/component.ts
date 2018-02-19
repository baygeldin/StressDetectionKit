import { Component } from 'react';
import Store from 'stores/main';
import Router from 'stores/router';

interface Context {
  store?: Store;
  router?: Router;
}

class ComponentWithContext<A, B> extends Component<Context & A, B> {
  store: Store;

  router: Router;

  constructor(props: Context & A) {
    super(props);

    this.store = this.props.store!;
    this.router = this.props.router!;
  }
}

export default ComponentWithContext;
