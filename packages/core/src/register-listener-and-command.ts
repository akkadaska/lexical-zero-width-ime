import { mergeRegister } from '@lexical/utils';
import { type LexicalEditor } from 'lexical';

import {
  registerCreateAndRemoveZeroWidthListener,
  registerRemoveUnnecessaryZeroWidthListener,
  registerZeroWidthIMESelectionCommands,
  registerZeroWidthRemoveListener,
} from './listeners';
import { type ZeroWidthIMENodeMapRef } from './zero-width-node-link-map';

/**
 * Registers listeners and commands related to `ZeroWidthIMENode`.
 * @param editor The editor instance.
 * @param zeroWidthNodeLinkMapRef The map to keep track of the zero width nodes and the nodes they are linked to.
 * @param textContent The text content of the `ZeroWidthIMENode`.
 * @returns The unregister function.
 */
export const registerZeroWidthIMEListenerAndCommand = (
  editor: LexicalEditor,
  zeroWidthNodeLinkMapRef: ZeroWidthIMENodeMapRef,
  textContent: string = '',
): (() => void) => {
  return mergeRegister(
    registerCreateAndRemoveZeroWidthListener(
      editor,
      zeroWidthNodeLinkMapRef,
      textContent,
    ),
    registerRemoveUnnecessaryZeroWidthListener(editor, zeroWidthNodeLinkMapRef),
    registerZeroWidthRemoveListener(editor, zeroWidthNodeLinkMapRef),
    registerZeroWidthIMESelectionCommands(editor),
  );
};
