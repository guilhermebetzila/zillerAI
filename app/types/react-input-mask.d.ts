declare module 'react-input-mask' {
  import * as React from 'react';

  interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    mask: string | (string | RegExp)[];
    maskChar?: string | null;
    alwaysShowMask?: boolean;
    formatChars?: { [key: string]: string };
    beforeMaskedValueChange?: (
      newState: { value: string; selection: { start: number; end: number } },
      oldState: { value: string; selection: { start: number; end: number } },
      userInput: string,
      inputRef: React.Ref<HTMLInputElement>,
      mask: string | (string | RegExp)[]
    ) => { value: string; selection: { start: number; end: number } };
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    value?: string;
  }

  export default class InputMask extends React.Component<Props> {}
}
