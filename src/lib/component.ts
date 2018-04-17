import { Component } from 'react';
import Store from 'stores/main';
import Router from 'stores/router';
import Ui from 'stores/ui';

interface Context {
  store?: Store;
  router?: Router;
  ui?: Ui;
}

class ComponentWithContext<A, B> extends Component<Context & A, B> {
  store: Store;
  router: Router;
  ui: Ui;

  constructor(props: Context & A) {
    super(props);

    this.store = this.props.store!;
    this.router = this.props.router!;
    this.ui = this.props.ui!;
  }
}

export default ComponentWithContext;
