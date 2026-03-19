class Stack<T> {
  private stack: T[] = [];
  constructor() {}
  push(item: T): number {
    this.stack.push(item);
    return this.stack.length;
  }
  pop(): T {
    if (this.stack.length === 0) {
      throw new Error("Stack : Stack Underflow");
    }
    return this.stack.pop()!;
  }
  peek(index: number = 0): T {
    if (this.stack.length === 0) {
      throw new Error("Stack : Stack is Empty");
    }
    if (index >= this.stack.length) {
      throw new Error("Stack : Index out of Range");
    }
    return this.stack[this.stack.length - index - 1]!;
  }
  isEmpty() {
    return this.stack.length === 0;
  }
  size() {
    return this.stack.length;
  }
  clear() {
    this.stack.length = 0;
    return true;
  }
}

export default Stack;
