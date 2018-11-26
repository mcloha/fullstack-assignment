const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const fs = require('fs');
const cors = require('cors');
const port = 4000;

const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/data/');
    },
    filename: (req, file, cb) => {
        const { originalname } = file;
        cb(null, originalname);
    }
})
const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use(express.static('public/build'));
app.use(cors());

app.post('/', upload.single('file'), (req, res) => {
    res.send('wav saved');
});

app.get('/list', (req, res) => {
    fs.readdir('./public/data', (err, files) => {
        if (err) throw err;
        res.send(files);
    })
})

io.on('connection', socket => {
    console.log('user connected');
    socket.on('stream', data => {
        console.log(data);
    })
})

server.listen(port, () => {
    console.log('server is running on port: ', port);
})