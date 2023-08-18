import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Divider, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

const testdata = {
	"landscapes": [{
		"id": "SystemLandscape",
		"name": "System Landscape",
		"description": ""
	}],
	"contexts": [{
		"id": "SystemContext",
		"name": "Internet Banking System - System Context",
		"description": ""
	}],
	"containers": [{
		"id": "Containers",
		"name": "Internet Banking System - Containers",
		"description": ""
	}],
	"components": [{
		"id": "Components",
		"name": "Internet Banking System - API Application - Components",
		"description": ""
	}]
}

interface ViewProps {
	id: string;
	type: string;
	name: string;
	description: string;
}

const View = ({ id, type, name, description = 'No description' }: ViewProps) => {
	return (
		<Box sx={{ minWidth: 275 }}>
			<Card variant='outlined'>
				<CardContent>
					<Typography variant="h5" component="div">
						{name}
					</Typography>
					<Typography sx={{ mb: 1.5 }} color="text.secondary">
						{type}
					</Typography>
					<Typography variant="body2">
						{description}
					</Typography>
				</CardContent>
				<CardActions>
					<Link to={`/${type}/${id}`}>View</Link>
				</CardActions>
			</Card>
		</Box >
	);
}

export default () => {
	return (
		<>
			<Typography variant="h3" component="div"> Landscapes </Typography>
			<Stack direction={'row'}>
				{testdata.landscapes.map((landscape) =>
					<View
						key={landscape.id}
						id={landscape.id}
						type='Landscape'
						name={landscape.name}
						description={landscape.description} />
				)}
			</Stack>
			<Divider style={{ padding: '10px' }} />
			<Typography variant="h3" component="div">Contexts</Typography>
			<Stack direction={'row'}>
				{testdata.contexts.map((landscape) =>
					<View
						key={landscape.id}
						id={landscape.id}
						type='Context'
						name={landscape.name}
						description={landscape.description} />
				)}
			</Stack>
			<Divider style={{ padding: '10px' }} />
			<Typography variant="h3" component="div">Containers</Typography>
			<Stack direction={'row'}>
				{testdata.containers.map((landscape) =>
					<View
						key={landscape.id}
						id={landscape.id}
						type='Container'
						name={landscape.name}
						description={landscape.description} />
				)}
			</Stack>
			<Divider style={{ padding: '10px' }} />
			<Typography variant="h3" component="div">Components</Typography>
			<Stack direction={'row'}>
				{testdata.components.map((landscape) =>
					<View
						key={landscape.id}
						id={landscape.id}
						type='Component'
						name={landscape.name}
						description={landscape.description} />
				)}
			</Stack>
		</>
	)
};
