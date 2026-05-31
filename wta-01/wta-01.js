// wta-01.js - WTA-01 Exam Results

let examData = [];
let examName = 'WTA-01';
let examDate = 'May 31, 2026';
window.currentWhatsAppText = '';

const SUBJECTS = ['MATHAMATICS', 'PHYSICS', 'CHEMISTRY'];
const SUBJECT_MAX_MARKS = {
    'MATHAMATICS': 100,
    'PHYSICS': 100,
    'CHEMISTRY': 100
};

function initExam(folderName) {
    examName = 'WTA-01';
    document.getElementById('exam-title').textContent = examName.toUpperCase() + ' RESULTS';
    document.getElementById('home-page').classList.remove('active');
    document.getElementById('exam-page').classList.add('active');
    document.getElementById('omr-input').value = '';
    document.getElementById('result-container').innerHTML = '';
    document.getElementById('error-msg').style.display = 'none';
    
    fetch(folderName + '/wta-01.json')
        .then(response => response.json())
        .then(data => {
            examData = data.map(student => computeStudentMetrics(student));
            computeCampusRanks(examData);
            computeSubjectRanks(examData);
            console.log(`Loaded ${examData.length} records for ${examName}`);
        })
        .catch(error => {
            console.error('Error loading data:', error);
            showError('Failed to load exam data.');
        });
    
    document.getElementById('omr-input').focus();
}

function computeStudentMetrics(student) {
    const normalized = { ...student };
    normalized.totalMarks = SUBJECTS.reduce((sum, subject) => sum + (parseInt(normalized[subject]) || 0), 0);
    normalized.totalMaxMarks = SUBJECTS.reduce((sum, subject) => sum + (SUBJECT_MAX_MARKS[subject] || 100), 0);
    normalized.percentage = ((normalized.totalMarks / normalized.totalMaxMarks) * 100).toFixed(2);
    return normalized;
}

function computeCampusRanks(data) {
    const sorted = [...data].sort((a, b) => b.totalMarks - a.totalMarks);
    let lastMarks = null;
    let rank = 0;

    sorted.forEach((student, index) => {
        if (student.totalMarks !== lastMarks) {
            rank = index + 1;
            lastMarks = student.totalMarks;
        }
        student.campusRank = rank;
    });
}

function computeSubjectRanks(data) {
    SUBJECTS.forEach(subject => {
        const sorted = [...data].sort((a, b) => (parseInt(b[subject]) || 0) - (parseInt(a[subject]) || 0));
        let lastMarks = null;
        let rank = 0;

        sorted.forEach((student, index) => {
            const marks = parseInt(student[subject]) || 0;
            if (marks !== lastMarks) {
                rank = index + 1;
                lastMarks = marks;
            }
            student[`${subject}_rank`] = rank;
        });
    });
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
    const subjectMap = {
        'MATHAMATICS': 'Mathematics',
        'PHYSICS': 'Physics',
        'CHEMISTRY': 'Chemistry'
    };

    const subjects = SUBJECTS.map(subject => {
        const marks = parseInt(student[subject]) || 0;
        const maxMarks = SUBJECT_MAX_MARKS[subject];

        return {
            name: subjectMap[subject],
            marks,
            maxMarks,
            rank: student[`${subject}_rank`] || '-'
        };
    });

    const totalMarks = student.totalMarks || 0;
    const totalMaxMarks = student.totalMaxMarks || SUBJECTS.reduce((sum, subject) => sum + (SUBJECT_MAX_MARKS[subject] || 100), 0);
    const percentage = parseFloat(student.percentage || 0).toFixed(2);
    const campusRank = student.campusRank || '-';

    const resultHTML = `
        <div class="result-card" id="marks-card">
            <div class="print-header">
                <img src="./assets/schoollogo.jfif" alt="Logo" class="print-logo">
                <div class="print-school-name">Sri Chaitanya PU & CBSE College (+2)</div>
                <div class="print-location">Marathahalli, Bengaluru</div>
                <div class="print-exam-name">${examName}</div>
                <div class="print-exam-date">Date: ${examDate}</div>
            </div>
            
            <div class="result-header">
                <h3>${examName.toUpperCase()} - MARKS CARD</h3>
            </div>
            
            <div class="student-details compact">
                <div class="detail-grid">
                    <div><span class="detail-label">Name:</span> <span class="detail-value">${escapeHtml(student['NAME OF THE STUDENT'])}</span></div>
                    <div><span class="detail-label">Adm No:</span> <span class="detail-value">${escapeHtml(student['ADM NO'])}</span></div>
                    <div><span class="detail-label">Section:</span> <span class="detail-value">${escapeHtml(student['SEC'])}</span></div>
                    <div><span class="detail-label">Exam Date:</span> <span class="detail-value">${examDate}</span></div>
                    <div><span class="detail-label">Percentage:</span> <span class="detail-value" style="font-weight: 800; color: var(--sc-blue);">${percentage}%</span></div>
                    <div><span class="detail-label">Total Obtained:</span> <span class="detail-value" style="font-weight: 800; color: var(--sc-red);">${totalMarks}</span></div>
                </div>
            </div>

            <div class="marks-section compact">
                <table class="marks-table compact-table">
                    <thead>
                        <tr>
                            <th class="col-subject">Subject</th>
                            <th class="col-marks">Marks</th>
                            <th class="col-max">Out of</th>
                            <th class="col-status">Rank</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${subjects.map(sub => `
                            <tr>
                                <td class="subject-name">${escapeHtml(sub.name)}</td>
                                <td class="marks-cell">${sub.marks}</td>
                                <td class="max-marks-cell">${sub.maxMarks}</td>
                                <td class="marks-cell">${sub.rank}</td>
                            </tr>
                        `).join('')}
                        <tr class="total-row">
                            <td class="col-subject"><strong>TOTAL (3 SUBJECTS)</strong></td>
                            <td class="marks-cell"><strong>${totalMarks}</strong></td>
                            <td class="max-marks-cell"><strong>${totalMaxMarks}</strong></td>
                            <td class="marks-cell"><strong>${campusRank}</strong></td>
                        </tr>
                    </tbody>
                </table>

                <div class="result-footer">
                    <div class="campus-rank-display">
                        <span class="percentage-value" style="font-size:22px; font-weight:800; color:var(--sc-red);">Campus Rank: ${campusRank}</span>
                    </div>
                </div>
            </div>

            <div class="action-buttons">
                <button class="btn btn-save btn-share" onclick="saveResult()">💾 Save</button>
                <button class="btn btn-whatsapp" onclick="shareWhatsApp()">💬 WhatsApp</button>
            </div>
        </div>
    `;

    window.currentWhatsAppText = `Sri Chaitanya ${examName} Result
Name: ${escapeHtml(student['NAME OF THE STUDENT'])}
Adm No: ${escapeHtml(student['ADM NO'])}
Section: ${escapeHtml(student['SEC'])}
Exam Date: ${examDate}
Mathematics: ${subjects[0].marks} (Rank ${subjects[0].rank})
Physics: ${subjects[1].marks} (Rank ${subjects[1].rank})
Chemistry: ${subjects[2].marks} (Rank ${subjects[2].rank})
Total: ${totalMarks}/${totalMaxMarks}
Percentage: ${percentage}%
Campus Rank: ${campusRank}
`;

    resultDiv.innerHTML = resultHTML;
}

function shareWhatsApp() {
    if (!window.currentWhatsAppText) {
        alert('Please search for a student result first before sharing.');
        return;
    }

    const encoded = encodeURIComponent(window.currentWhatsAppText);
    const url = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, '_blank');
}

function saveResult() {
    const marksCard = document.getElementById('marks-card');
    if (!marksCard) {
        alert('Please search for a student result first before saving.');
        return;
    }

    window.print();
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
