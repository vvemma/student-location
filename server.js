const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const mongoUri = process.env.MONGO_URI;

mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,  // 서버 선택 타임아웃 설정
    socketTimeoutMS: 45000,         // 소켓 타임아웃 설정
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const studentSchema = new mongoose.Schema({
    class: String,
    number: String,
    name: String,
    time: [String],
    location: String,
});

const Student = mongoose.model('Student', studentSchema);

app.use(express.static('public'));

io.on('connection', async (socket) => {
    console.log('New client connected');

    try {
        const students = await Student.find();
        socket.emit('initialData', students);
    } catch (err) {
        console.error('Error fetching students:', err);
    }

    socket.on('addStudent', async (studentData) => {
        console.log('Received new student:', studentData);
        const student = new Student(studentData);
        try {
            await student.save();
            const students = await Student.find();
            io.emit('updateData', students);
        } catch (err) {
            console.error('Error saving student:', err);
        }
    });

    socket.on('updateStudent', async ({ index, updatedStudent }) => {
        console.log('Received updated student:', index, updatedStudent);
        try {
            await Student.findByIdAndUpdate(updatedStudent._id, updatedStudent, { new: true });
            const students = await Student.find();
            io.emit('updateData', students);
        } catch (err) {
            console.error('Error updating student:', err);
        }
    });

    socket.on('sortData', async (data) => {
        console.log('Sort data by:', data.criteria);
        try {
            let students = await Student.find();
            if (data.criteria === 'class') {
                students = students.sort((a, b) => {
                    if (a.class === b.class) {
                        return parseInt(a.number) - parseInt(b.number);
                    }
                    return parseInt(a.class) - parseInt(b.class);
                });
            } else if (data.criteria === 'location') {
                students = students.sort((a, b) => a.location.localeCompare(b.location));
            }
            io.emit('updateData', students);
        } catch (err) {
            console.error('Error fetching or sorting students:', err);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
