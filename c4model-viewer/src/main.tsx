import React from 'react';
import ReactDOM from 'react-dom/client';
import Landscape from './Landscape';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import ViewList from './ViewList';
import { QueryClient, QueryClientProvider } from 'react-query';
import Context from './Context';
import ComponentView from './ComponentView';
import  Container  from './Container';

const router = createBrowserRouter([
	{
		path: '/',
		element: <ViewList />,
	},
	{
		path: '/landscape/:id',
		element: <Landscape />,
	},
	{
		path: '/context/:id',
		element: <Context />,
	},
	{
		path: '/container/:id',
		element: <Container />,
	},
	{
		path: '/component/:id',
		element: <ComponentView />,
	},
]);

const client = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<QueryClientProvider client={client}>
			<RouterProvider router={router} />
		</QueryClientProvider>
	</React.StrictMode>,
);
