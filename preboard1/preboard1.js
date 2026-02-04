// preboard1.js - Pre-Board 1 Exam Results

let examData = [];
let examName = 'Pre-Board 1';

const SUBJECT_MAX_MARKS = {
    'ENGLISH': 80,
    'MATHAMATICS': 80,
    'PHYSICS': 75,
    'CHEMISTRY': 75,
    'null': 75
};

const PASSING_PERCENTAGE = 35;

function initExam(folderName) {
    examName = 'Pre-Board 1';
    document.getElementById('exam-title').textContent = examName.toUpperCase() + ' RESULTS';
    document.getElementById('home-page').classList.remove('active');
    document.getElementById('exam-page').classList.add('active');
    document.getElementById('omr-input').value = '';
    document.getElementById('result-container').innerHTML = '';
    document.getElementById('error-msg').style.display = 'none';
    
    fetch(folderName + '/preboard1.json')
        .then(response => response.json())
        .then(data => {
            examData = data;
            console.log(`Loaded ${data.length} records for ${examName}`);
        })
        .catch(error => {
            console.error('Error loading data:', error);
            showError('Failed to load exam data.');
        });
    
    document.getElementById('omr-input').focus();
}

function searchStudent() {
    const admNo = document.getElementById('omr-input').value.trim();
    const errorDiv = document.getElementById('error-msg');
    const resultDiv = document.getElementById('result-container');
    
    resultDiv.innerHTML = '';
    errorDiv.style.display = 'none';

    if (!admNo) {
        errorDiv.textContent = 'Please enter an Admission Number';
        errorDiv.style.display = 'block';
        return;
    }

    const student = examData.find(s => s['ADM NO'] === admNo);

    if (!student) {
        errorDiv.textContent = 'No results found for Admission Number: ' + admNo;
        errorDiv.style.display = 'block';
        return;
    }

    displayResult(student);
}

function displayResult(student) {
    const resultDiv = document.getElementById('result-container');
    
    const subjects = [];
    const subjectMap = {
        'ENGLISH': 'English',
        'MATHAMATICS': 'Mathematics',
        'PHYSICS': 'Physics',
        'CHEMISTRY': 'Chemistry',
        'null': student['OPTIONAL'] || 'Optional'
    };

    const metaKeys = ['ADM NO', 'NAME OF THE STUDENT', 'SEC', 'OPTIONAL', 'TOT\n370'];
    
    let failedSubjects = 0;
    let totalMaxMarks = 0;
    
    for (let key in student) {
        if (!metaKeys.includes(key)) {
            const marks = parseInt(student[key]) || 0;
            const subjectName = subjectMap[key] || key;
            const maxMarks = SUBJECT_MAX_MARKS[key] || 75;
            const passingMarks = Math.ceil((maxMarks * PASSING_PERCENTAGE) / 100);
            const passFail = marks >= passingMarks ? 'P' : 'F';
            
            if (passFail === 'F') failedSubjects++;
            totalMaxMarks += maxMarks;
            
            subjects.push({ 
                name: subjectName, 
                marks: marks,
                maxMarks: maxMarks,
                status: passFail,
                statusClass: passFail === 'P' ? 'status-pass' : 'status-fail'
            });
        }
    }

    const totalMarks = parseInt(student['TOT\n370']) || 0;
    const percentage = ((totalMarks / totalMaxMarks) * 100).toFixed(2);
    const hasPassed = failedSubjects === 0;
    
    let grade = 'F';
    if (hasPassed) {
        if (percentage >= 90) grade = 'A+';
        else if (percentage >= 80) grade = 'A';
        else if (percentage >= 70) grade = 'B+';
        else if (percentage >= 60) grade = 'B';
        else if (percentage >= 50) grade = 'C';
        else if (percentage >= 40) grade = 'D';
    }

    const resultHTML = `
        <div class="result-card" id="marks-card">
            <!-- Print Header -->
            <div class="print-header">
                <img src="./assets/schoollogo.jfif" alt="Logo" class="print-logo">
                <div class="print-school-name">Sri Chaitanya PU & CBSE College (+2)</div>
                <div class="print-location">Marathahalli, Bengaluru</div>
                <div class="print-exam-name">${examName}</div>
            </div>
            
            <div class="result-header">
                <h3>${examName.toUpperCase()} - MARKS CARD</h3>
            </div>
            
            <div class="student-details compact">
                <div class="detail-grid">
                    <div><span class="detail-label">Name:</span> <span class="detail-value">${escapeHtml(student['NAME OF THE STUDENT'])}</span></div>
                    <div><span class="detail-label">Adm No:</span> <span class="detail-value">${escapeHtml(student['ADM NO'])}</span></div>
                    <div><span class="detail-label">Section:</span> <span class="detail-value">${escapeHtml(student['SEC'])}</span></div>
                    <div><span class="detail-label">Optional:</span> <span class="detail-value">${escapeHtml(student['OPTIONAL'])}</span></div>
                </div>
            </div>

            <div class="marks-section compact">
                <table class="marks-table compact-table">
                    <thead>
                        <tr>
                            <th class="col-subject">Subject</th>
                            <th class="col-marks">Marks</th>
                            <th class="col-max">Out of</th>
                            <th class="col-status">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${subjects.map(sub => `
                            <tr>
                                <td class="subject-name">${escapeHtml(sub.name)}</td>
                                <td class="marks-cell">${sub.marks}</td>
                                <td class="max-marks-cell">${sub.maxMarks}</td>
                                <td class="status-cell ${sub.statusClass}">${sub.status}</td>
                            </tr>
                        `).join('')}
                        <tr class="total-row">
                            <td class="col-subject"><strong>TOTAL</strong></td>
                            <td class="marks-cell"><strong>${totalMarks}</strong></td>
                            <td class="max-marks-cell"><strong>${totalMaxMarks}</strong></td>
                            <td class="status-cell ${hasPassed ? 'status-pass' : 'status-fail'}"><strong>${hasPassed ? 'PASS' : 'FAIL'}</strong></td>
                        </tr>
                    </tbody>
                </table>

                <div class="result-footer">
                    ${hasPassed ? `
                        <div class="percentage-display">
                            <span class="percentage-value">${percentage}%</span>
                            <span class="grade-badge">Grade ${grade}</span>
                        </div>
                        <div class="status-message pass-msg">✓ PASSED</div>
                    ` : `
                        <div class="status-message fail-msg">✗ FAILED - Better Luck Next Time</div>
                    `}
                </div>
            </div>

            <div class="action-buttons">
                <button class="btn btn-save" onclick="sharePDF()">📤 Share</button>
                <button class="btn btn-print" onclick="printResult()">🖨️ Print</button>
            </div>
        </div>
    `;

    resultDiv.innerHTML = resultHTML;
}

function printResult() {
    window.print();
}

function sharePDF() {
    if (navigator.share) {
        navigator.share({
            title: 'Sri Chaitanya - Exam Results',
            text: 'My exam results',
            url: window.location.href
        }).catch(err => console.log('Share cancelled'));
    } else {
        alert('To share:\n1. Click Print\n2. Select "Save as PDF"\n3. Share the PDF');
    }
}

function showError(message) {
    const errorDiv = document.getElementById('error-msg');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[s]);
}