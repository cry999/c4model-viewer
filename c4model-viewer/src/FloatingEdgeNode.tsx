import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

type FloatingEdgeNodeProps = React.PropsWithChildren<{}>;


export default memo(({ children }: FloatingEdgeNodeProps) => {
	return (
		<>
			{children}
			<Handle type="source" style={{ top: '-15px' }} position={Position.Top} id="a" />
			<Handle type="source" style={{ right: '-15px' }} position={Position.Right} id="b" />
			<Handle type="source" style={{ bottom: '-15px' }} position={Position.Bottom} id="c" />
			<Handle type="source" style={{ left: '-15px' }} position={Position.Left} id="d" />
		</>
	);
});
