import React from 'react';
import 'reactflow/dist/style.css';
import {
	Background,
	BackgroundVariant,
	Connection,
	Controls,
	Edge,
	MiniMap,
	Node,
	ConnectionMode,
	ReactFlow,
	MarkerType,
	addEdge,
	useEdgesState,
	useNodesState,
	NodeProps,
} from 'reactflow';
import { useCallback, useLayoutEffect } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import ELK, { LayoutOptions } from 'elkjs';
import { Box, Button, Card, Typography } from '@mui/material';
import { ZoomIn as ZoomInIcon } from '@mui/icons-material';
import FloatingEdgeNode from './FloatingEdgeNode';
import FloatingEdge from './FloatingEdge';

const elk = new ELK();

export const elkopts = {
	'elk.algorithm': 'layered',
	'elk.layered.spacing.nodeNodeBetweenLayers': '100',
	'elk.spacing.nodeNode': '80',
}

export const autoLayout = async (nodes: any[], edges: any[], options: LayoutOptions = elkopts) => {
	return elk.
		layout({
			id: 'root',
			layoutOptions: options,
			children: nodes?.map((node) => ({
				...node,
				width: 200,
				height: 100,
			})),
			edges: edges,
		}).
		then((g) => ({
			nodes: g.children?.map((node) => ({
				...node,
				position: { x: node.x, y: node.y },
			})),
			edges: g.edges,
		}));
}

const ElementName = (props: { name: string }) => (
	<Typography variant='h6' align='center' >{props.name}</Typography>
);

const ElementTags = (props: { tags?: string[] }) => (
	<Typography variant='body2' align='center' >[{props.tags?.join(', ') || '-'}]</Typography>
);

const LinkBehavior = React.forwardRef<HTMLAnchorElement, Omit<LinkProps, 'to'> & { href: LinkProps['to'] }>(
	({ href, ...other }, ref) => (<Link ref={ref} to={href} {...other} />));

const ElementViewLink = (props: { viewUrl: string }) => (
	<Button LinkComponent={LinkBehavior} href={`${props.viewUrl}`}>
		<ZoomInIcon />
	</Button>
);

type ElementNodeProps = NodeProps<NodeData>;

const ElementNode = (props: ElementNodeProps) => {
	return (
		<FloatingEdgeNode >
			<Box textAlign='center'>
				<Card style={{ padding: '5px', width: '200px', alignItems: 'center' }} variant='outlined'>
					{/*					<Handle type="target" position={Position.Top} />*/}
					<ElementName name={props.data.name} />
					<ElementTags tags={props.data.tags} />
					{props.data.viewUrl && <ElementViewLink viewUrl={props.data.viewUrl} />}
					{/*					<Handle type="source" position={Position.Bottom} />*/}
				</Card>
			</Box>
		</FloatingEdgeNode>
	);
}

interface NodeData {
	name: string;
	viewUrl: string;
	tags?: string[];
	technologies?: string[];
}

const nodeTypes = { element: ElementNode };
const edgeTypes = { relationship: FloatingEdge };
const defaultEdgeOptions = {
	type: 'relationship',
	markerEnd: {
		type: MarkerType.Arrow,
	},
};

export interface DiagramProps {
	nodes: Node<NodeData>[];
	edges: Edge[];
}

export default (props: React.PropsWithChildren<DiagramProps>) => {

	const [nodes, setNodes, onNodesChange] = useNodesState(props.nodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(props.edges);

	const onConnect = useCallback(
		(params: Edge | Connection) => setEdges((value) => addEdge(params, value)),
		[],
	);
	const onLayout = useCallback(({ useInitialNodes = false }) => {
		const opts = { ...elkopts, 'elk.direction': 'DOWN' };
		const ns = useInitialNodes ? props.nodes : nodes;
		const es = useInitialNodes ? props.edges : edges;

		autoLayout(ns, es, opts).then((layout) => {
			if (layout === undefined) { return; }
			setNodes(layout.nodes as any);
			setEdges(layout.edges as any);
		});
	},
		[nodes, edges],
	);

	useLayoutEffect(() => {
		onLayout({ useInitialNodes: true });
	}, []);


	return (
		<>
			<div style={{ width: '100vw', height: '100vh' }}>
				<ReactFlow
					nodeTypes={nodeTypes}
					edgeTypes={edgeTypes}
					nodes={nodes}
					edges={edges}
					onNodesChange={onNodesChange}
					onEdgesChange={onEdgesChange}
					onConnect={onConnect}
					connectionMode={ConnectionMode.Loose}
					defaultEdgeOptions={defaultEdgeOptions}
					fitView
					fitViewOptions={{ padding: 5 }}
				>
					<Controls />
					<MiniMap />
					<Background variant={BackgroundVariant.Dots} gap={12} size={1} color='#888' />
				</ReactFlow>
			</div>
		</>
	)
}
