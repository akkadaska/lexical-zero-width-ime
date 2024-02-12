import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  type LinkedNodeKey,
  type ZeroWidthIMENodeKey,
  registerZeroWidthIMEListenerAndCommand,
} from 'lexical-zero-width-ime';
import { useEffect, useRef } from 'react';

/**
 * Props of `ZeroWidthWithIMEPluginProps`.
 */
export interface ZeroWidthWithIMEPluginProps {
  /**
   * A text content of `ZeroWidthIMENode`.
   */
  textContent?: string;
}

/**
 * A Lexical editor plugin for React to fix Safari caret issues and IME conflicts using Zero Width No-Break Space.
 * Setting `ZERO_WIDTH_IME_CHARACTER` for `textContent` props is recommended, but remember that `ZERO_WIDTH_IME_CHARACTER` may be included in the output of `getTextContent()` from your editor.
 * @see https://github.com/akkadaska/lexical-zero-width-ime
 * @example
 * import {
 *   ZeroWidthIMENode,
 *   ZeroWidthWithIMEPlugin,
 *   ZERO_WIDTH_IME_CHARACTER,
 * } from '@lexical-zero-width/react';
 * 
 * const initialConfig = {
 *   // Your editor initial config
 *   nodes: [ZeroWidthIMENode], // This plugin uses `ZeroWidthIMENode`.
 * };
 * 
 * function MyEditor() {
 *   return (
 *     <LexicalComposer initialConfig={initialConfig}>
 *       {
 *         // Your editor components
 *       }
 *       <ZeroWidthWithIMEPlugin textContent={ZERO_WIDTH_IME_CHARACTER} />
 *     </LexicalComposer>
 *   );
 * }

 */
export const ZeroWidthWithIMEPlugin = ({
  textContent,
}: ZeroWidthWithIMEPluginProps): JSX.Element | null => {
  const [editor] = useLexicalComposerContext();
  const zeroWidthNodeLinkMapRef = useRef(
    new Map<ZeroWidthIMENodeKey, LinkedNodeKey>(),
  );

  useEffect(() => {
    return registerZeroWidthIMEListenerAndCommand(
      editor,
      zeroWidthNodeLinkMapRef,
      textContent,
    );
  }, [editor, textContent]);

  return null;
};
