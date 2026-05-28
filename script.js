const data = {
    users: [],
    students: [],
    attendance: [],
    admins: []
};

let currentUser = null;

// Default Admin credentials
const ADMIN_CREDENTIALS = {
    email: 'admin@smartattend.com',
    password: 'admin123'
};

document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    setTodayDate();
    loadDataFromStorage();
    updateUserDisplay();
});

function initializeEventListeners() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', switchTab);
    });

    document.getElementById('registerForm').addEventListener('submit', handleRegister);

    document.getElementById('registerForm2').addEventListener('submit', handleRegister2);

    document.getElementById('loginForm').addEventListener('submit', handleLogin);

    document.getElementById('addStudentForm').addEventListener('submit', handleAddStudent);

    document.getElementById('recordAttendanceForm').addEventListener('submit', handleRecordAttendance);

    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Admin Registration
    document.getElementById('adminRegisterForm').addEventListener('submit', handleAdminRegister);

    // Admin event listeners
    const promoteUserForms = document.querySelectorAll('.promote-user-form');
    promoteUserForms.forEach(form => {
        form.addEventListener('submit', handlePromoteUser);
    });

    const deleteUserBtns = document.querySelectorAll('.delete-user-btn');
    deleteUserBtns.forEach(btn => {
        btn.addEventListener('click', handleDeleteUser);
    });

    const deleteStudentBtns = document.querySelectorAll('.delete-student-btn');
    deleteStudentBtns.forEach(btn => {
        btn.addEventListener('click', handleDeleteStudent);
    });

    const editStudentBtns = document.querySelectorAll('.edit-student-btn');
    editStudentBtns.forEach(btn => {
        btn.addEventListener('click', handleEditStudent);
    });

    const deleteAttendanceBtns = document.querySelectorAll('.delete-attendance-btn');
    deleteAttendanceBtns.forEach(btn => {
        btn.addEventListener('click', handleDeleteAttendance);
    });

    const editAttendanceBtns = document.querySelectorAll('.edit-attendance-btn');
    editAttendanceBtns.forEach(btn => {
        btn.addEventListener('click', handleEditAttendance);
    });
}

function switchTab(e) {
    const tabName = e.target.dataset.tab;

    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    e.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();

    if (data.users.some(user => user.email === email)) {
        showMessage('registerMsg', 'Email already registered!', 'error');
        return;
    }

    const newUser = { name, email, password };
    data.users.push(newUser);
    saveDataToStorage();

    showMessage('registerMsg', `User "${name}" registered successfully!`, 'success');
    document.getElementById('registerForm').reset();
}

function handleRegister2(e) {
    e.preventDefault();

    const name = document.getElementById('regName2').value.trim();
    const email = document.getElementById('regEmail2').value.trim();
    const password = document.getElementById('regPassword2').value.trim();

    if (data.users.some(user => user.email === email)) {
        showMessage('registerMsg2', 'Email already registered!', 'error');
        return;
    }

    const newUser = { name, email, password, role: 'user' };
    data.users.push(newUser);
    saveDataToStorage();

    showMessage('registerMsg2', `Account created! Please login with your credentials.`, 'success');
    document.getElementById('registerForm2').reset();
}

// Admin Registration
function handleAdminRegister(e) {
    e.preventDefault();

    const name = document.getElementById('adminRegName').value.trim();
    const email = document.getElementById('adminRegEmail').value.trim();
    const password = document.getElementById('adminRegPassword').value.trim();
    const confirmPassword = document.getElementById('adminRegConfirmPassword').value.trim();

    // Validate passwords match
    if (password !== confirmPassword) {
        showMessage('adminRegisterMsg', 'Passwords do not match!', 'error');
        return;
    }

    // Check if email already exists in users or admins
    if (data.users.some(user => user.email === email) || data.admins.some(admin => admin.email === email)) {
        showMessage('adminRegisterMsg', 'Email already registered!', 'error');
        return;
    }

    const newAdmin = { name, email, password, role: 'admin' };
    data.admins.push(newAdmin);
    saveDataToStorage();

    showMessage('adminRegisterMsg', `Admin account created! You can now login as admin.`, 'success');
    document.getElementById('adminRegisterForm').reset();
}

function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    // Check if default admin login
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        currentUser = {
            name: 'Admin',
            email: email,
            password: password,
            role: 'admin'
        };
        showMessage('loginMsg', `Welcome back, Admin!`, 'success');
        updateUserDisplay();
        document.getElementById('loginForm').reset();
        
        setTimeout(() => {
            const adminBtn = document.querySelector('[data-tab="admin"]');
            if (adminBtn) {
                adminBtn.click();
            }
        }, 1000);
        return;
    }

    // Check if registered admin
    const admin = data.admins.find(a => a.email === email && a.password === password);
    if (admin) {
        currentUser = { ...admin };
        showMessage('loginMsg', `Welcome back, ${admin.name}!`, 'success');
        updateUserDisplay();
        document.getElementById('loginForm').reset();
        
        setTimeout(() => {
            const adminBtn = document.querySelector('[data-tab="admin"]');
            if (adminBtn) {
                adminBtn.click();
            }
        }, 1000);
        return;
    }

    // Check if regular user
    const user = data.users.find(u => u.email === email && u.password === password);

    if (user) {
        currentUser = { ...user };
        showMessage('loginMsg', `Welcome back, ${user.name}!`, 'success');
        updateUserDisplay();
        document.getElementById('loginForm').reset();
        
        setTimeout(() => {
            const studentBtn = document.querySelector('[data-tab="students"]');
            if (studentBtn) {
                studentBtn.click();
            }
        }, 1000);
    } else {
        showMessage('loginMsg', 'Invalid Email or Password!', 'error');
    }
}

function handleLogout() {
    currentUser = null;
    updateUserDisplay();
    document.getElementById('logoutBtn').style.display = 'none';
    
    const loginBtn = document.querySelector('[data-tab="login"]');
    if (loginBtn) {
        loginBtn.click();
    }
}

function updateUserDisplay() {
    const userDisplay = document.getElementById('loggedInUser');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginTab = document.querySelector('[data-tab="login"]');
    const studentTab = document.querySelector('[data-tab="students"]');
    const attendanceTab = document.querySelector('[data-tab="attendance"]');
    const adminTab = document.querySelector('[data-tab="admin"]');
    const loginContent = document.getElementById('login');
    const studentContent = document.getElementById('students');
    const attendanceContent = document.getElementById('attendance');
    const adminContent = document.getElementById('admin');

    if (currentUser) {
        const roleDisplay = currentUser.role === 'admin' ? ' (ADMIN)' : '';
        userDisplay.textContent = `✅ Logged in as: ${currentUser.name}${roleDisplay} (${currentUser.email})`;
        logoutBtn.style.display = 'inline-block';
        
        loginTab.classList.add('hidden');
        loginContent.classList.add('hidden');
        
        if (currentUser.role === 'admin') {
            // Show only admin tab for admin users
            adminTab.classList.remove('hidden');
            adminContent.classList.remove('hidden');
            studentTab.classList.add('hidden');
            attendanceTab.classList.add('hidden');
            studentContent.classList.add('hidden');
            attendanceContent.classList.add('hidden');
            displayAdminDashboard();
        } else {
            // Show protected tabs and content for regular users
            adminTab.classList.add('hidden');
            adminContent.classList.add('hidden');
            studentTab.classList.remove('hidden');
            attendanceTab.classList.remove('hidden');
            studentContent.classList.remove('hidden');
            attendanceContent.classList.remove('hidden');
        }
    } else {
        userDisplay.textContent = '❌ Not logged in';
        logoutBtn.style.display = 'none';
        
        // Show Login tab and Register section
        loginTab.classList.remove('hidden');
        loginContent.classList.remove('hidden');
        
        // Hide protected tabs and content
        studentTab.classList.add('hidden');
        attendanceTab.classList.add('hidden');
        adminTab.classList.add('hidden');
        studentContent.classList.add('hidden');
        attendanceContent.classList.add('hidden');
        adminContent.classList.add('hidden');
    }
}

// Add Student
function handleAddStudent(e) {
    e.preventDefault();

    const id = parseInt(document.getElementById('studentId').value);
    const name = document.getElementById('studentName').value.trim();
    const course = document.getElementById('studentCourse').value.trim();

    // Check if student ID already exists
    if (data.students.some(student => student.id === id)) {
        showMessage('addStudentMsg', 'Student ID already exists!', 'error');
        return;
    }

    const newStudent = { id, name, course };
    data.students.push(newStudent);
    saveDataToStorage();

    showMessage('addStudentMsg', `Student "${name}" added successfully!`, 'success');
    document.getElementById('addStudentForm').reset();
    displayStudents();
}

// Display Students
function displayStudents() {
    const tbody = document.getElementById('studentsBody');

    if (data.students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="no-data">No students added yet</td></tr>';
        return;
    }

    tbody.innerHTML = data.students.map(student => `
        <tr>
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.course}</td>
        </tr>
    `).join('');
}

// Record Attendance
function handleRecordAttendance(e) {
    e.preventDefault();

    const studentId = parseInt(document.getElementById('attStudentId').value);
    const date = document.getElementById('attDate').value;
    const status = document.getElementById('attStatus').value;

    // Check if student exists
    if (!data.students.some(student => student.id === studentId)) {
        showMessage('recordAttMsg', 'Student ID not found!', 'error');
        return;
    }

    const newAttendance = { studentId, date, status };
    data.attendance.push(newAttendance);
    saveDataToStorage();

    showMessage('recordAttMsg', 'Attendance recorded successfully!', 'success');
    document.getElementById('recordAttendanceForm').reset();
    setTodayDate();
    displayAttendance();
}

// Display Attendance
function displayAttendance() {
    const tbody = document.getElementById('attendanceBody');

    if (data.attendance.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="no-data">No attendance records yet</td></tr>';
        return;
    }

    tbody.innerHTML = data.attendance.map(record => `
        <tr>
            <td>${record.studentId}</td>
            <td>${record.date}</td>
            <td><span class="status-badge ${record.status.toLowerCase()}">${record.status}</span></td>
        </tr>
    `).join('');
}

// Show Message
function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `message ${type}`;

    setTimeout(() => {
        element.className = 'message';
    }, 5000);
}

// Set Today's Date
function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('attDate').value = today;
}

// Local Storage
function saveDataToStorage() {
    localStorage.setItem('smartAttendData', JSON.stringify(data));
}

function loadDataFromStorage() {
    const stored = localStorage.getItem('smartAttendData');
    if (stored) {
        const parsed = JSON.parse(stored);
        data.users = parsed.users || [];
        data.students = parsed.students || [];
        data.attendance = parsed.attendance || [];
    }
}

// ==================== ADMIN FUNCTIONS ====================

// Display Admin Dashboard
function displayAdminDashboard() {
    displayAdminStats();
    displayUsersTable();
    displayStudentsTableAdmin();
    displayAttendanceTableAdmin();
}

// Display Admin Statistics
function displayAdminStats() {
    const totalUsers = data.users.length;
    const totalStudents = data.students.length;
    const totalAttendance = data.attendance.length;
    const presentCount = data.attendance.filter(a => a.status === 'Present').length;
    const absentCount = data.attendance.filter(a => a.status === 'Absent').length;
    const lateCount = data.attendance.filter(a => a.status === 'Late').length;

    document.getElementById('adminTotalUsers').textContent = totalUsers;
    document.getElementById('adminTotalStudents').textContent = totalStudents;
    document.getElementById('adminTotalAttendance').textContent = totalAttendance;
    document.getElementById('adminPresentCount').textContent = presentCount;
    document.getElementById('adminAbsentCount').textContent = absentCount;
    document.getElementById('adminLateCount').textContent = lateCount;
}

// Display Users Management Table
function displayUsersTable() {
    const tbody = document.getElementById('usersTableBody');

    if (data.users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">No users registered yet</td></tr>';
        return;
    }

    tbody.innerHTML = data.users.map((user, index) => `
        <tr>
            <td>${user.email}</td>
            <td>${user.name}</td>
            <td><span class="badge-user">User</span></td>
            <td>
                <button class="btn btn-sm btn-info delete-user-btn" data-email="${user.email}">Delete</button>
            </td>
        </tr>
    `).join('');

    // Add admin accounts to the table
    if (data.admins.length > 0) {
        const adminRows = data.admins.map((admin, index) => `
            <tr>
                <td>${admin.email}</td>
                <td>${admin.name}</td>
                <td><span class="badge-admin">Admin</span></td>
                <td>
                    <button class="btn btn-sm btn-danger delete-admin-btn" data-email="${admin.email}">Delete</button>
                </td>
            </tr>
        `).join('');
        tbody.innerHTML += adminRows;
    }

    // Re-attach event listeners
    document.querySelectorAll('.delete-user-btn').forEach(btn => {
        btn.addEventListener('click', handleDeleteUser);
    });

    document.querySelectorAll('.delete-admin-btn').forEach(btn => {
        btn.addEventListener('click', handleDeleteAdmin);
    });
}

// Delete User
function handleDeleteUser(e) {
    const email = e.target.dataset.email;
    if (confirm(`Are you sure you want to delete user ${email}?`)) {
        data.users = data.users.filter(u => u.email !== email);
        saveDataToStorage();
        showMessage('adminMsg', `User ${email} deleted successfully!`, 'success');
        displayUsersTable();
    }
}

// Delete Admin
function handleDeleteAdmin(e) {
    const email = e.target.dataset.email;
    if (confirm(`Are you sure you want to delete admin ${email}?`)) {
        data.admins = data.admins.filter(a => a.email !== email);
        saveDataToStorage();
        showMessage('adminMsg', `Admin ${email} deleted successfully!`, 'success');
        displayUsersTable();
    }
}

// Display Students Management Table (Admin)
function displayStudentsTableAdmin() {
    const tbody = document.getElementById('studentsTableAdminBody');

    if (data.students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">No students added yet</td></tr>';
        return;
    }

    tbody.innerHTML = data.students.map((student, index) => `
        <tr>
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.course}</td>
            <td>
                <button class="btn btn-sm btn-info edit-student-btn" data-index="${index}">Edit</button>
                <button class="btn btn-sm btn-danger delete-student-btn" data-id="${student.id}">Delete</button>
            </td>
        </tr>
    `).join('');

    // Re-attach event listeners
    document.querySelectorAll('.delete-student-btn').forEach(btn => {
        btn.addEventListener('click', handleDeleteStudent);
    });

    document.querySelectorAll('.edit-student-btn').forEach(btn => {
        btn.addEventListener('click', handleEditStudent);
    });
}

// Delete Student
function handleDeleteStudent(e) {
    const id = parseInt(e.target.dataset.id);
    const student = data.students.find(s => s.id === id);
    if (confirm(`Are you sure you want to delete student ${student.name}?`)) {
        data.students = data.students.filter(s => s.id !== id);
        // Also delete attendance records for this student
        data.attendance = data.attendance.filter(a => a.studentId !== id);
        saveDataToStorage();
        showMessage('adminMsg', `Student deleted successfully!`, 'success');
        displayStudentsTableAdmin();
        displayAttendanceTableAdmin();
    }
}

// Edit Student
function handleEditStudent(e) {
    const index = parseInt(e.target.dataset.index);
    const student = data.students[index];
    const newName = prompt(`Edit student name (current: ${student.name}):`, student.name);
    if (newName !== null && newName.trim() !== '') {
        data.students[index].name = newName.trim();
        saveDataToStorage();
        showMessage('adminMsg', `Student updated successfully!`, 'success');
        displayStudentsTableAdmin();
    }
}

// Display Attendance Management Table (Admin)
function displayAttendanceTableAdmin() {
    const tbody = document.getElementById('attendanceTableAdminBody');

    if (data.attendance.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">No attendance records yet</td></tr>';
        return;
    }

    tbody.innerHTML = data.attendance.map((record, index) => {
        const student = data.students.find(s => s.id === record.studentId);
        const studentName = student ? student.name : 'Unknown';
        return `
            <tr>
                <td>${record.studentId} - ${studentName}</td>
                <td>${record.date}</td>
                <td><span class="status-badge ${record.status.toLowerCase()}">${record.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-info edit-attendance-btn" data-index="${index}">Edit</button>
                    <button class="btn btn-sm btn-danger delete-attendance-btn" data-index="${index}">Delete</button>
                </td>
            </tr>
        `;
    }).join('');

    // Re-attach event listeners
    document.querySelectorAll('.delete-attendance-btn').forEach(btn => {
        btn.addEventListener('click', handleDeleteAttendance);
    });

    document.querySelectorAll('.edit-attendance-btn').forEach(btn => {
        btn.addEventListener('click', handleEditAttendance);
    });
}

// Delete Attendance Record
function handleDeleteAttendance(e) {
    const index = parseInt(e.target.dataset.index);
    if (confirm('Are you sure you want to delete this attendance record?')) {
        data.attendance.splice(index, 1);
        saveDataToStorage();
        showMessage('adminMsg', `Attendance record deleted successfully!`, 'success');
        displayAttendanceTableAdmin();
    }
}

// Edit Attendance Record
function handleEditAttendance(e) {
    const index = parseInt(e.target.dataset.index);
    const record = data.attendance[index];
    const currentStatus = record.status;
    const newStatus = prompt(`Edit attendance status (current: ${currentStatus}):\nOptions: Present, Absent, Late`, currentStatus);
    
    if (newStatus !== null && ['Present', 'Absent', 'Late'].includes(newStatus)) {
        data.attendance[index].status = newStatus;
        saveDataToStorage();
        showMessage('adminMsg', `Attendance record updated successfully!`, 'success');
        displayAttendanceTableAdmin();
    } else if (newStatus !== null) {
        showMessage('adminMsg', `Invalid status. Please use: Present, Absent, or Late`, 'error');
    }
}

// Add CSS for status badges dynamically
const style = document.createElement('style');
style.textContent = `
    .status-badge {
        padding: 6px 12px;
        border-radius: 20px;
        font-weight: 600;
        font-size: 0.85em;
    }
    .status-badge.present {
        background: #d4edda;
        color: #155724;
    }
    .status-badge.absent {
        background: #f8d7da;
        color: #721c24;
    }
    .status-badge.late {
        background: #fff3cd;
        color: #856404;
    }
`;
document.head.appendChild(style);
