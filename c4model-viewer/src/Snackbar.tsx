import React from 'react';
import { Snackbar, AlertProps, Alert as MuiAlert, AlertColor } from "@mui/material";
import { useState } from "react";
import { useCallback } from "react";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>((props, ref) => {
	return <MuiAlert elevation={6} ref={ref} variant='filled' {...props} />;
})

export const useSnackbar = () => {
	const [open, setOpen] = useState(false);
	const [message, setMessage] = useState("");
	const [severety, setSeverity] = useState('info' as AlertColor);

	const handleOpen = (msg: string, serverity: AlertColor) => {
		setOpen(true);
		setMessage(msg);
		setSeverity(serverity);
	};

	const handleClose = useCallback(() => {
		setOpen(false);
		setMessage("");
		setSeverity('info');
	}, [setOpen]);

	return {
		openSnackbar: handleOpen,
		onClose: handleClose,
		Snackbar: () => (
			<Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
				<Alert onClose={handleClose} severity={severety}>{message}</Alert>
			</Snackbar>
		),
	};
};
