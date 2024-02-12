import { type NodeKey } from 'lexical';

/**
 * `NodeKey` of `ZeroWidthIMENode`.
 */
export type ZeroWidthIMENodeKey = NodeKey;

/**
 * `NodeKey` of the node that is linked to `ZeroWidthIMENode`.
 */
export type LinkedNodeKey = NodeKey;

/**
 * Map to keep track of the zero width nodes and the nodes that are linked to them.
 * "Linked" means that the node should have `ZeroWidthIMENode` as a next sibling node and should be removed if the `ZeroWidthIMENode` is removed.
 */
export type ZeroWidthIMENodeMap = Map<ZeroWidthIMENodeKey, LinkedNodeKey>;

/**
 * Reference of `ZeroWidthIMENodeMap`.
 */
export interface ZeroWidthIMENodeMapRef {
  current: ZeroWidthIMENodeMap;
}
