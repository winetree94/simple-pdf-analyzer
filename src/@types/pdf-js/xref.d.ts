declare interface XRef {
  trailer: Dict;
  fetch: (value: any, suppressEncryption?: boolean) => any;
}
