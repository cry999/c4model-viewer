import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import { useMemo } from 'react';

export interface DynamicView {
	id: string;
	name: string;
	title: string;
	steps: {
		[stepOrder: string]: string; // relationshipId
	};
}

export interface DynamicViewListProps {
	views: {
		[viewType: string]: DynamicView;
	};
	onClick: (view: DynamicView) => void;
};

export default function DynamicViewList(props: DynamicViewListProps) {
	const keys = useMemo(() => Object.keys(props.views || {}), [props.views]);
	console.log(props);
	return (
		<List>
			{keys.map((key) => (
				<ListItem key={key} disablePadding>
					<ListItemButton onClick={() => props.onClick(props.views[key])}>
						<ListItemIcon>
							<InboxIcon />
						</ListItemIcon>
						<ListItemText primary={key} />
					</ListItemButton>
				</ListItem>
			))}
		</List>
	);
}
