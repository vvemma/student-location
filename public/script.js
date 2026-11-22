document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    const addStudentButton = document.getElementById('add-student');
    const sortClassButton = document.getElementById('sort-class');
    const sortLocationButton = document.getElementById('sort-location');
    const studentsTableBody = document.getElementById('students-body');
    const exportCSVButton = document.getElementById('export-csv-button');

    const classInput = document.getElementById('class');
    const numberInput = document.getElementById('number');
    const nameInput = document.getElementById('name');
    const timeInputs = document.querySelectorAll('.time-input');
    const locationInput = document.getElementById('location');

    let students = [];

    socket.on('connect', () => {
        console.log('Connected to server');
    });

    socket.on('initialData', (data) => {
        console.log('Initial data received:', data);
        students = data;
        renderTable(data);
    });

    socket.on('updateData', (data) => {
        console.log('Update data received:', data);
        students = data;
        renderTable(data);
    });

    const renderTable = (data) => {
        studentsTableBody.innerHTML = '';
        data.forEach((student, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="text" value="${student.class}" data-index="${index}" data-field="class" readonly></td>
                <td><input type="text" value="${student.number}" data-index="${index}" data-field="number" readonly></td>
                <td><input type="text" value="${student.name}" data-index="${index}" data-field="name" readonly></td>
                <td><input type="text" value="${student.time.join(', ')}" data-index="${index}" data-field="time" readonly></td>
                <td><input type="text" value="${student.location}" data-index="${index}" data-field="location" readonly></td>
                <td><button class="edit-button" data-index="${index}">수정</button><button class="save-button" data-index="${index}" style="display:none;">저장</button></td>
            `;
            studentsTableBody.appendChild(row);
        });

        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                toggleEditMode(index, true);
            });
        });

        document.querySelectorAll('.save-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                saveChanges(index);
                toggleEditMode(index, false);
            });
        });
    };

    const toggleEditMode = (index, isEditMode) => {
        document.querySelectorAll(`input[data-index="${index}"]`).forEach(input => {
            input.readOnly = !isEditMode;
        });
        document.querySelector(`.edit-button[data-index="${index}"]`).style.display = isEditMode ? 'none' : 'inline';
        document.querySelector(`.save-button[data-index="${index}"]`).style.display = isEditMode ? 'inline' : 'none';
    };

    const saveChanges = (index) => {
        const updatedStudent = {
            _id: students[index]._id, // _id 추가
            class: document.querySelector(`input[data-index="${index}"][data-field="class"]`).value,
            number: document.querySelector(`input[data-index="${index}"][data-field="number"]`).value,
            name: document.querySelector(`input[data-index="${index}"][data-field="name"]`).value,
            time: document.querySelector(`input[data-index="${index}"][data-field="time"]`).value.split(',').map(item => item.trim()),
            location: document.querySelector(`input[data-index="${index}"][data-field="location"]`).value
        };
        socket.emit('updateStudent', { index, updatedStudent });
    };

    const addStudent = () => {
        const student = {
            class: classInput.value,
            number: numberInput.value,
            name: nameInput.value,
            time: getTimeInputs(),
            location: locationInput.value
        };
        socket.emit('addStudent', student);
        classInput.value = '';
        numberInput.value = '';
        nameInput.value = '';
        clearTimeInputs();
        locationInput.value = '';
    };

    const sortByClass = () => {
        socket.emit('sortData', { criteria: 'class' });
    };

    const sortByLocation = () => {
        socket.emit('sortData', { criteria: 'location' });
    };

    const getTimeInputs = () => {
        let times = [];
        timeInputs.forEach(input => {
            if (input.checked) {
                times.push(input.value);
            }
        });
        return times;
    };

    const clearTimeInputs = () => {
        document.querySelectorAll('.time-input').forEach(input => {
            input.checked = false;
        });
    };

    const ExportCSV = () => {
        const data = students.map(student => {
            const studentData = [
                student.class,
                student.number,
                student.name
            ];

            // 시간표에 맞춰 위치를 추가
            const times = ['1교시', '2교시', '3교시', '4교시', '5교시', '6교시'];
            times.forEach(time => {
                if (student.time.includes(time)) {
                    studentData.push(student.location);
                } else {
                    studentData.push('');
                }
            });

            return studentData;
        });

        // CSV 문자열 생성
        let csvContent = '\ufeff반,번호,이름,1교시,2교시,3교시,4교시,5교시,6교시\n'; // BOM(Byte Order Mark) 추가
        data.forEach(row => {
            csvContent += row.join(',') + '\n';
        });

        // Blob 객체 생성
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

        // 다운로드 링크 생성
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'students.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    addStudentButton.addEventListener('click', addStudent);
    sortClassButton.addEventListener('click', sortByClass);
    sortLocationButton.addEventListener('click', sortByLocation);
    exportCSVButton.addEventListener('click', ExportCSV);
});
