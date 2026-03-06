// Resume Data Structure
let resumeData = {
    personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        summary: ''
    },
    experience: [],
    education: [],
    skills: [],
    projects: []
};

let currentResumeId = null;

// Initialize editor
function initEditor() {
    if (!isAuthenticated()) {
        window.location.href = '../index.html';
        return;
    }
    
    loadResume();
    setupEventListeners();
    renderPreview();
}

// Setup event listeners
function setupEventListeners() {
    // Personal info
    document.getElementById('fullName')?.addEventListener('input', (e) => {
        resumeData.personalInfo.fullName = e.target.value;
        updatePreview();
    });

    document.getElementById('email')?.addEventListener('input', (e) => {
        resumeData.personalInfo.email = e.target.value;
        updatePreview();
    });

    document.getElementById('phone')?.addEventListener('input', (e) => {
        resumeData.personalInfo.phone = e.target.value;
        updatePreview();
    });

    document.getElementById('location')?.addEventListener('input', (e) => {
        resumeData.personalInfo.location = e.target.value;
        updatePreview();
    });

    document.getElementById('summary')?.addEventListener('input', (e) => {
        resumeData.personalInfo.summary = e.target.value;
        updatePreview();
    });

    // Buttons
    document.getElementById('saveBtn')?.addEventListener('click', saveResume);
    document.getElementById('downloadBtn')?.addEventListener('click', downloadPDF);
    document.getElementById('addExperienceBtn')?.addEventListener('click', addExperience);
    document.getElementById('addEducationBtn')?.addEventListener('click', addEducation);
    document.getElementById('addSkillBtn')?.addEventListener('click', addSkill);
}

// Add experience
function addExperience() {
    const experience = {
        id: generateId(),
        jobTitle: '',
        company: '',
        startDate: '',
        endDate: '',
        description: ''
    };
    resumeData.experience.push(experience);
    renderExperienceList();
    updatePreview();
}

// Add education
function addEducation() {
    const education = {
        id: generateId(),
        school: '',
        degree: '',
        field: '',
        graduationDate: ''
    };
    resumeData.education.push(education);
    renderEducationList();
    updatePreview();
}

// Add skill
function addSkill() {
    const skillInput = document.getElementById('skillInput');
    if (skillInput.value.trim()) {
        resumeData.skills.push(skillInput.value.trim());
        skillInput.value = '';
        renderSkillsList();
        updatePreview();
    }
}

// Remove experience
function removeExperience(id) {
    resumeData.experience = resumeData.experience.filter(exp => exp.id !== id);
    renderExperienceList();
    updatePreview();
}

// Remove education
function removeEducation(id) {
    resumeData.education = resumeData.education.filter(edu => edu.id !== id);
    renderEducationList();
    updatePreview();
}

// Remove skill
function removeSkill(index) {
    resumeData.skills.splice(index, 1);
    renderSkillsList();
    updatePreview();
}

// Update preview
function updatePreview() {
    renderPreview();
}

// Render preview
function renderPreview() {
    const preview = document.getElementById('resumePreview');
    if (!preview) return;

    let html = `
        <div class="resume-header">
            <h1>${resumeData.personalInfo.fullName || 'Your Name'}</h1>
            <div class="resume-contact">
                ${resumeData.personalInfo.email ? `<span>${resumeData.personalInfo.email}</span>` : ''}
                ${resumeData.personalInfo.phone ? `<span>${resumeData.personalInfo.phone}</span>` : ''}
                ${resumeData.personalInfo.location ? `<span>${resumeData.personalInfo.location}</span>` : ''}
            </div>
        </div>
    `;

    if (resumeData.personalInfo.summary) {
        html += `
            <div class="resume-section">
                <h2>Professional Summary</h2>
                <p>${resumeData.personalInfo.summary}</p>
            </div>
        `;
    }

    if (resumeData.experience.length > 0) {
        html += `
            <div class="resume-section">
                <h2>Experience</h2>
        `;
        resumeData.experience.forEach(exp => {
            html += `
                <div class="resume-item">
                    <h3>${exp.jobTitle || 'Job Title'}</h3>
                    <p class="company">${exp.company || 'Company'}</p>
                    <p class="date">${exp.startDate || 'Start Date'} - ${exp.endDate || 'End Date'}</p>
                    <p>${exp.description || ''}</p>
                </div>
            `;
        });
        html += `</div>`;
    }

    if (resumeData.education.length > 0) {
        html += `
            <div class="resume-section">
                <h2>Education</h2>
        `;
        resumeData.education.forEach(edu => {
            html += `
                <div class="resume-item">
                    <h3>${edu.degree || 'Degree'}</h3>
                    <p class="school">${edu.school || 'School'}</p>
                    <p class="field">${edu.field || 'Field of Study'}</p>
                    <p class="date">${edu.graduationDate || 'Graduation Date'}</p>
                </div>
            `;
        });
        html += `</div>`;
    }

    if (resumeData.skills.length > 0) {
        html += `
            <div class="resume-section">
                <h2>Skills</h2>
                <div class="skills-list">
                    ${resumeData.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            </div>
        `;
    }

    preview.innerHTML = html;
}

// Save resume
async function saveResume() {
    try {
        const method = currentResumeId ? 'PUT' : 'POST';
        const url = currentResumeId 
            ? `${API_URL}/resumes/${currentResumeId}`
            : `${API_URL}/resumes`;

        const response = await fetchWithToken(url, {
            method,
            body: JSON.stringify({
                title: resumeData.personalInfo.fullName || 'My Resume',
                content: resumeData
            })
        });

        const data = await response.json();

        if (response.ok) {
            currentResumeId = data._id;
            showNotification('Resume saved successfully!', 'success');
        } else {
            showNotification(data.error || 'Failed to save resume', 'error');
        }
    } catch (error) {
        console.error('Save error:', error);
        showNotification('An error occurred while saving', 'error');
    }
}

// Load resume
async function loadResume() {
    try {
        const response = await fetchWithToken(`${API_URL}/resumes`);
        const resumes = await response.json();

        if (resumes.length > 0) {
            resumeData = resumes[0].content;
            currentResumeId = resumes[0]._id;
            populateForm();
            renderPreview();
        }
    } catch (error) {
        console.error('Load error:', error);
    }
}

// Populate form from resume data
function populateForm() {
    document.getElementById('fullName').value = resumeData.personalInfo.fullName || '';
    document.getElementById('email').value = resumeData.personalInfo.email || '';
    document.getElementById('phone').value = resumeData.personalInfo.phone || '';
    document.getElementById('location').value = resumeData.personalInfo.location || '';
    document.getElementById('summary').value = resumeData.personalInfo.summary || '';
}

// Download as PDF
function downloadPDF() {
    const preview = document.getElementById('resumePreview');
    const opt = {
        margin: 10,
        filename: `${resumeData.personalInfo.fullName || 'resume'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };

    // This requires html2pdf library
    if (typeof html2pdf !== 'undefined') {
        html2pdf().set(opt).from(preview).save();
    } else {
        showNotification('PDF library not loaded', 'error');
    }
}

// Render experience list
function renderExperienceList() {
    const list = document.getElementById('experienceList');
    if (!list) return;

    list.innerHTML = resumeData.experience.map(exp => `
        <div class="form-section">
            <input type="text" placeholder="Job Title" value="${exp.jobTitle}" 
                   onchange="updateExperience('${exp.id}', 'jobTitle', this.value)">
            <input type="text" placeholder="Company" value="${exp.company}" 
                   onchange="updateExperience('${exp.id}', 'company', this.value)">
            <input type="date" value="${exp.startDate}" 
                   onchange="updateExperience('${exp.id}', 'startDate', this.value)">
            <input type="date" value="${exp.endDate}" 
                   onchange="updateExperience('${exp.id}', 'endDate', this.value)">
            <textarea placeholder="Description" onchange="updateExperience('${exp.id}', 'description', this.value)">${exp.description}</textarea>
            <button onclick="removeExperience('${exp.id}')" class="btn-danger">Remove</button>
        </div>
    `).join('');
}

// Update experience
function updateExperience(id, field, value) {
    const exp = resumeData.experience.find(e => e.id === id);
    if (exp) {
        exp[field] = value;
        updatePreview();
    }
}

// Render education list
function renderEducationList() {
    const list = document.getElementById('educationList');
    if (!list) return;

    list.innerHTML = resumeData.education.map(edu => `
        <div class="form-section">
            <input type="text" placeholder="School" value="${edu.school}" 
                   onchange="updateEducation('${edu.id}', 'school', this.value)">
            <input type="text" placeholder="Degree" value="${edu.degree}" 
                   onchange="updateEducation('${edu.id}', 'degree', this.value)">
            <input type="text" placeholder="Field of Study" value="${edu.field}" 
                   onchange="updateEducation('${edu.id}', 'field', this.value)">
            <input type="date" value="${edu.graduationDate}" 
                   onchange="updateEducation('${edu.id}', 'graduationDate', this.value)">
            <button onclick="removeEducation('${edu.id}')" class="btn-danger">Remove</button>
        </div>
    `).join('');
}

// Update education
function updateEducation(id, field, value) {
    const edu = resumeData.education.find(e => e.id === id);
    if (edu) {
        edu[field] = value;
        updatePreview();
    }
}

// Render skills list
function renderSkillsList() {
    const list = document.getElementById('skillsList');
    if (!list) return;

    list.innerHTML = `
        <div class="skills-container">
            ${resumeData.skills.map((skill, index) => `
                <div class="skill-item">
                    <span>${skill}</span>
                    <button onclick="removeSkill(${index})" class="btn-small">×</button>
                </div>
            `).join('')}
        </div>
    `;
}