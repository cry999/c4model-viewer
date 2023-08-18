import { useCallback } from 'react';
import { useStore, getBezierPath, Node, Position, internalsSymbol, EdgeProps, BaseEdge, EdgeLabelRenderer } from 'reactflow';

function getParams(nodeA: Node, nodeB: Node): [number, number, Position] {
	const centerA = getNodeCenter(nodeA);
	const centerB = getNodeCenter(nodeB);

	const horizontalDiff = Math.abs(centerA.x - centerB.x);
	const verticalDiff = Math.abs(centerA.y - centerB.y);

	const position = function() {
		// when the horizontal difference between the nodes is bigger, we use Position.Left or Position.Right for the handle
		if (horizontalDiff > verticalDiff) {
			return centerA.x > centerB.x ? Position.Left : Position.Right;
		}
		// here the vertical difference between the nodes is bigger, so we use Position.Top or Position.Bottom for the handle
		return centerA.y > centerB.y ? Position.Top : Position.Bottom;
	}();

	const [x, y] = getHandleCoordsByPosition(nodeA, position);
	return [x, y, position];
}

function getHandleCoordsByPosition(node: Node, handlePosition: Position) {
	// all handles are from type source, that's why we use handleBounds.source here
	const handle = node[internalsSymbol]?.handleBounds?.source?.find(
		(h) => h.position === handlePosition
	)!;

	let offsetX = handle.width / 2;
	let offsetY = handle.height / 2;

	// this is a tiny detail to make the markerEnd of an edge visible.
	// The handle position that gets calculated has the origin top-left, so depending which side we are using, we add a little offset
	// when the handlePosition is Position.Right for example, we need to add an offset as big as the handle itself in order to get the correct position
	switch (handlePosition) {
		case Position.Left:
			offsetX = 0;
			break;
		case Position.Right:
			offsetX = handle.width;
			break;
		case Position.Top:
			offsetY = 0;
			break;
		case Position.Bottom:
			offsetY = handle.height;
			break;
	}

	const x = node.positionAbsolute!.x + handle.x + offsetX;
	const y = node.positionAbsolute!.y + handle.y + offsetY;

	return [x, y];
}

function getNodeCenter(node: Node) {
	return {
		x: node.positionAbsolute!.x + node.width! / 2,
		y: node.positionAbsolute!.y + node.height! / 2,
	};
}

// returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) you need to create an edge
export function getEdgeParams(source: Node, target: Node) {
	const [sx, sy, sourcePos] = getParams(source, target);
	const [tx, ty, targetPos] = getParams(target, source);

	return {
		sx,
		sy,
		tx,
		ty,
		sourcePos,
		targetPos,
	};
}

const onEdgeClick = () => {
};

function FloatingEdge({ id, source, target, markerEnd, style, label, labelStyle }: EdgeProps) {
	const sourceNode = useStore(useCallback((store) => store.nodeInternals.get(source), [source]));
	const targetNode = useStore(useCallback((store) => store.nodeInternals.get(target), [target]));

	if (!sourceNode || !targetNode) {
		return null;
	}

	const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);

	const [edgePath, labelX, labelY] = getBezierPath({
		sourceX: sx,
		sourceY: sy,
		sourcePosition: sourcePos,
		targetPosition: targetPos,
		targetX: tx,
		targetY: ty,
	});

	return (
		<>
			<BaseEdge
				id={id}
				path={edgePath}
				markerEnd={markerEnd}
				style={style}
			/>
			<EdgeLabelRenderer >
				<div style={{
					...labelStyle,
					position: 'absolute',
					transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
					fontSize: 12,
					pointerEvents: 'all',
				}}>
					{label}
				</div>
			</EdgeLabelRenderer>
		</>
	);
}

export default FloatingEdge;

