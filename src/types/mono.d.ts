declare module "@mono.co/connect.js" {
  export default class Connect {
    constructor(options: any);
    setup(): void;
    open(): void;
    close(): void;
  }
}
