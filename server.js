const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const pty = require('node-pty');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';
    
    const ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.env.HOME,
        env: process.env
    });

    ptyProcess.on('data', function(data) {
        socket.emit('output', data);
    });

    socket.on('input', (data) => {
        ptyProcess.write(data);
    });

    socket.on('disconnect', () => {
        ptyProcess.kill();
    });
});

const port = 3000;
server.listen(port, () => {
    console.log("Terminal server is running on http://localhost:3000");
});
