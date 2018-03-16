import { createAtom, IAtom } from 'mobx';
import Denque from 'denque';

class ObservableDeque<T> extends Denque<T> {
  atom: IAtom;

  constructor(...args: any[]) {
    super(...args);

    this.atom = createAtom('Deque');
  }

  get length() {
    this.atom.reportObserved();
    return super.length;
  }

  push(...items: T[]) {
    const result = super.push(...items);
    this.atom.reportChanged();
    return result;
  }

  unshift(...items: T[]) {
    const result = super.unshift(...items);
    this.atom.reportChanged();
    return result;
  }

  pop() {
    const result = super.pop();
    this.atom.reportChanged();
    return result;
  }

  shift() {
    const result = super.shift();
    this.atom.reportChanged();
    return result;
  }

  remove(index: number, count: number) {
    const result = super.remove(index, count);
    this.atom.reportChanged();
    return result;
  }

  removeOne(index: number) {
    const result = super.removeOne(index);
    this.atom.reportChanged();
    return result;
  }

  splice(index: number, count: number, ...items: T[]) {
    const result = super.splice(index, count, ...items);
    this.atom.reportChanged();
    return result;
  }

  clear() {
    const result = super.clear();
    this.atom.reportChanged();
    return result;
  }

  toArray() {
    this.atom.reportObserved();
    return super.toArray();
  }

  peekBack() {
    this.atom.reportObserved();
    return super.peekBack();
  }

  peekFront() {
    this.atom.reportObserved();
    return super.peekFront();
  }

  peekAt(index: number) {
    this.atom.reportObserved();
    return super.peekAt(index);
  }

  isEmpty() {
    this.atom.reportObserved();
    return super.isEmpty();
  }
}

export default ObservableDeque;
