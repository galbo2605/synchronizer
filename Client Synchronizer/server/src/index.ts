import express from 'express';
import { json as bodyParseJSON } from 'body-parser';
import cors from 'cors';
import { join } from 'path';
import autoRoutes from 'express-auto-routes';

const app = express(),
	port = process.env.PORT || 4000;
// register dependencies
app.use(cors())
	.use(bodyParseJSON())
	.use(express.static(join(__dirname, 'angular-dist')));

// auto route controllers
autoRoutes(app)(join(__dirname, './controllers'));

// serve angular ui
app.get('*', (req, res) => {
	res.sendFile(join(__dirname, 'angular-dist/index.html'));
});

app.listen(port);
