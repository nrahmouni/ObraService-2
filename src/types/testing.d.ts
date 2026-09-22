import '@testing-library/react';

declare module '@testing-library/react' {
  export const screen: any;
  export const fireEvent: any;
  export const waitFor: any;
  export const within: any;
}
