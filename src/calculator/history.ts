import { ThistoryItem } from "../types/index.js";

export default class History {
  constructor(private key = "calc_history") {}

  getItems(): ThistoryItem[] {
    const items = localStorage.getItem(this.key);
    if (!items) return [];
    try {
      return JSON.parse(items);
    } catch (e) {
      console.error("Failed to parse history items:", e);
      return [];
    }
  }

  clear() {
    localStorage.removeItem(this.key);
  }

  push(item: ThistoryItem) {
    let items = this.getItems();
    if (!items) {
      items = [];
    }
    items.push(item);
    localStorage.setItem(this.key, JSON.stringify(items));
  }
}
