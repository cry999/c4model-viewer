import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import 'reactflow/dist/style.css';
import {
	Background,
	BackgroundVariant,
	Controls,
	MiniMap,
} from 'reactflow';
import Diagram from './Diagram';


const ComponentView = () => {
	const { id } = useParams();

	const { isLoading, error, data } = useQuery<any, any>(['component', id],
		() => fetch(`http://localhost:8080/components/${id}`).then((res) => res.json()),
	);

	if (isLoading) return <p>Loading...</p>;
	if (error) return <p>Error :(</p>;

	const nodes = data?.elements?.map((element: any) => ({
		id: element.id,
		type: 'element',
		data: { ...element },
		position: { x: 0, y: 0 },
	}));
	const edges = data?.relationships?.map((relationship: any) => ({
		id: relationship.id,
		type: 'relationship',
		source: relationship.sourceId,
		target: relationship.destinationId,
		animated: true,
		label: relationship.description,
	}));

	return (
		<>
			<div style={{ width: '100vw', height: '100vh' }}>
				<Diagram nodes={nodes} edges={edges} >
					<Controls />
					<MiniMap />
					<Background variant={BackgroundVariant.Dots} gap={12} size={1} color='#888' />
				</Diagram>
			</div>

		</>
	)
}

export default ComponentView
