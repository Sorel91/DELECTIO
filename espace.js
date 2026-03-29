const STORAGE_KEY = 'delectio-math-data-v1';

const defaultData = {
  teachers: [
    { id: 't1', name: 'Mme Karim' },
    { id: 't2', name: 'M. Salem' },
  ],
  students: [
    { id: 's1', name: 'Lina' },
    { id: 's2', name: 'Yanis' },
    { id: 's3', name: 'Aya' },
    { id: 's4', name: 'Sami' },
  ],
  courses: [
    {
      id: 'c1',
      title: 'Maths College - Groupe A',
      teacherId: 't1',
      studentIds: ['s1', 's2', 's3'],
      zoomMeetingId: '12345678901',
      zoomPasscode: '',
      zoomLink: 'https://zoom.us/j/12345678901',
    },
    {
      id: 'c2',
      title: 'Maths Lycee - Groupe B',
      teacherId: 't1',
      studentIds: ['s2', 's4'],
      zoomMeetingId: '23456789012',
      zoomPasscode: '',
      zoomLink: 'https://zoom.us/j/23456789012',
    },
    {
      id: 'c3',
      title: 'Maths Universite - Groupe C',
      teacherId: 't2',
      studentIds: ['s1', 's4'],
      zoomMeetingId: '34567890123',
      zoomPasscode: '',
      zoomLink: 'https://zoom.us/j/34567890123',
    },
  ],
  progress: [
    {
      id: 'p1',
      studentId: 's1',
      courseId: 'c1',
      chapter: 'Fractions et simplification',
      difficulty: 'Difficulte sur les exercices de probleme inverse.',
      createdAt: new Date().toISOString(),
    },
  ],
};

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    return structuredClone(defaultData);
  }

  try {
    const parsed = JSON.parse(raw);
    const normalized = normalizeData(parsed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    return structuredClone(defaultData);
  }
}

function normalizeData(data) {
  const merged = {
    ...structuredClone(defaultData),
    ...data,
  };

  merged.courses = (data.courses && Array.isArray(data.courses) ? data.courses : defaultData.courses).map(
    (course) => {
      const fallback = defaultData.courses.find((item) => item.id === course.id);
      return {
        ...course,
        zoomMeetingId: course.zoomMeetingId || fallback?.zoomMeetingId || '',
        zoomPasscode: course.zoomPasscode || fallback?.zoomPasscode || '',
        zoomLink: course.zoomLink || fallback?.zoomLink || '',
      };
    }
  );

  return merged;
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const state = {
  data: loadData(),
  role: 'student',
  activeStudentId: null,
  activeTeacherId: null,
};

const roleTabs = document.querySelectorAll('.role-tab');
const studentPanel = document.querySelector('#student-space');
const teacherPanel = document.querySelector('#teacher-space');
const studentSelect = document.querySelector('#student-select');
const teacherSelect = document.querySelector('#teacher-select');
const studentCourses = document.querySelector('#student-courses');
const chapterCourse = document.querySelector('#chapter-course');
const chapterForm = document.querySelector('#chapter-form');
const chapterTitle = document.querySelector('#chapter-title');
const chapterDifficulty = document.querySelector('#chapter-difficulty');
const studentHistory = document.querySelector('#student-history');
const studentFeedback = document.querySelector('#student-feedback');
const teacherCourses = document.querySelector('#teacher-courses');
const teacherInsights = document.querySelector('#teacher-insights');
const teacherZoomFeedback = document.querySelector('#teacher-zoom-feedback');

function getStudentById(id) {
  return state.data.students.find((student) => student.id === id);
}

function getTeacherById(id) {
  return state.data.teachers.find((teacher) => teacher.id === id);
}

function getCourseById(id) {
  return state.data.courses.find((course) => course.id === id);
}

function studentCourseList(studentId) {
  return state.data.courses.filter((course) => course.studentIds.includes(studentId));
}

function teacherCourseList(teacherId) {
  return state.data.courses.filter((course) => course.teacherId === teacherId);
}

function sanitizeMeetingId(value) {
  return value.replace(/\D+/g, '');
}

function escapeAttr(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function buildZoomLink(course) {
  if (course.zoomLink && course.zoomLink.trim().length > 0) {
    return course.zoomLink.trim();
  }

  const meetingId = sanitizeMeetingId(course.zoomMeetingId || '');
  if (!meetingId) {
    return '';
  }

  const passcode = (course.zoomPasscode || '').trim();
  if (!passcode) {
    return `https://zoom.us/j/${meetingId}`;
  }

  return `https://zoom.us/j/${meetingId}?pwd=${encodeURIComponent(passcode)}`;
}

function buildInAppZoomLink(course) {
  const resolvedZoomLink = buildZoomLink(course);
  if (!resolvedZoomLink) {
    return '';
  }

  return `visio.html?zoom=${encodeURIComponent(resolvedZoomLink)}&course=${encodeURIComponent(course.title)}`;
}

function switchRole(role) {
  state.role = role;
  roleTabs.forEach((tab) => {
    tab.classList.toggle('is-active', tab.dataset.role === role);
  });

  studentPanel.classList.toggle('is-visible', role === 'student');
  teacherPanel.classList.toggle('is-visible', role === 'teacher');
}

function renderStudentSelect() {
  studentSelect.innerHTML = state.data.students
    .map((student) => `<option value="${student.id}">${student.name}</option>`)
    .join('');

  state.activeStudentId = state.activeStudentId || state.data.students[0]?.id || null;
  studentSelect.value = state.activeStudentId || '';
}

function renderTeacherSelect() {
  teacherSelect.innerHTML = state.data.teachers
    .map((teacher) => `<option value="${teacher.id}">${teacher.name}</option>`)
    .join('');

  state.activeTeacherId = state.activeTeacherId || state.data.teachers[0]?.id || null;
  teacherSelect.value = state.activeTeacherId || '';
}

function renderStudentCourses() {
  if (!state.activeStudentId) {
    studentCourses.innerHTML = '<li class="empty">Aucun etudiant selectionne.</li>';
    chapterCourse.innerHTML = '';
    return;
  }

  const courses = studentCourseList(state.activeStudentId);

  if (courses.length === 0) {
    studentCourses.innerHTML = '<li class="empty">Aucun cours abonne.</li>';
    chapterCourse.innerHTML = '';
    return;
  }

  studentCourses.innerHTML = courses
    .map((course) => {
      const inAppZoomLink = buildInAppZoomLink(course);
      const zoomButton = inAppZoomLink
        ? `<a class="btn-zoom" href="${inAppZoomLink}">Ouvrir la visio dans DELECTIO</a>`
        : '<span class="zoom-missing">Lien Zoom a definir</span>';

      return `
        <li class="course-item">
          <span>${course.title}</span>
          ${zoomButton}
        </li>
      `;
    })
    .join('');

  chapterCourse.innerHTML = courses
    .map((course) => `<option value="${course.id}">${course.title}</option>`)
    .join('');
}

function renderStudentHistory() {
  if (!state.activeStudentId) {
    studentHistory.innerHTML = '<div class="empty">Aucun historique disponible.</div>';
    return;
  }

  const items = state.data.progress
    .filter((entry) => entry.studentId === state.activeStudentId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (items.length === 0) {
    studentHistory.innerHTML = '<div class="empty">Aucun chapitre renseigne pour le moment.</div>';
    return;
  }

  studentHistory.innerHTML = items
    .map((entry) => {
      const course = getCourseById(entry.courseId);
      const date = new Date(entry.createdAt).toLocaleDateString('fr-FR');
      const difficultyText = entry.difficulty && entry.difficulty.trim().length > 0
        ? entry.difficulty
        : 'Aucune difficulte mentionnee.';

      return `
        <article class="item">
          <strong>${entry.chapter}</strong>
          <div class="item-meta">${course ? course.title : 'Cours inconnu'} - ${date}</div>
          <p><strong>Difficulte:</strong> ${difficultyText}</p>
        </article>
      `;
    })
    .join('');
}

function renderTeacherCourses() {
  if (!state.activeTeacherId) {
    teacherCourses.innerHTML = '<div class="empty">Aucun enseignant selectionne.</div>';
    return;
  }

  const courses = teacherCourseList(state.activeTeacherId);

  if (courses.length === 0) {
    teacherCourses.innerHTML = '<div class="empty">Aucun cours attribue.</div>';
    return;
  }

  teacherCourses.innerHTML = courses
    .map((course) => {
      const studentNames = course.studentIds
        .map((id) => getStudentById(id)?.name)
        .filter(Boolean)
        .join(', ');
      const inAppZoomLink = buildInAppZoomLink(course);
      const zoomMeetingId = course.zoomMeetingId || '';
      const zoomPasscode = course.zoomPasscode || '';

      return `
        <article class="item">
          <strong>${course.title}</strong>
          <p><strong>Eleves inscrits:</strong> ${studentNames || 'Aucun eleve'}</p>
          ${inAppZoomLink
            ? `<a class="btn-zoom" href="${inAppZoomLink}">Ouvrir la visio dans DELECTIO</a>`
            : '<p class="item-meta">Lien Zoom non configure.</p>'}
          <form class="zoom-form" data-course-id="${course.id}">
            <div class="zoom-grid">
              <label>
                ID de reunion Zoom
                <input
                  type="text"
                  name="zoomMeetingId"
                  inputmode="numeric"
                  placeholder="Ex: 12345678901"
                  value="${escapeAttr(zoomMeetingId)}"
                >
              </label>
              <label>
                Mot de passe Zoom
                <input
                  type="text"
                  name="zoomPasscode"
                  placeholder="Ex: Maths2026"
                  value="${escapeAttr(zoomPasscode)}"
                >
              </label>
            </div>
            <label>
              Lien Zoom personnalise (optionnel)
              <input
                type="url"
                name="zoomLink"
                placeholder="https://zoom.us/j/..."
                value="${escapeAttr(course.zoomLink || '')}"
              >
            </label>
            <button class="btn-secondary" type="submit">Enregistrer Zoom</button>
          </form>
        </article>
      `;
    })
    .join('');
}

function renderTeacherInsights() {
  if (!state.activeTeacherId) {
    teacherInsights.innerHTML = '<div class="empty">Aucune donnee a afficher.</div>';
    return;
  }

  const teacherCoursesIds = teacherCourseList(state.activeTeacherId).map((course) => course.id);
  const entries = state.data.progress
    .filter((entry) => teacherCoursesIds.includes(entry.courseId))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (entries.length === 0) {
    teacherInsights.innerHTML = '<div class="empty">Aucune remontee de chapitre pour le moment.</div>';
    return;
  }

  teacherInsights.innerHTML = entries
    .map((entry) => {
      const student = getStudentById(entry.studentId);
      const course = getCourseById(entry.courseId);
      const date = new Date(entry.createdAt).toLocaleDateString('fr-FR');
      const difficultyText = entry.difficulty && entry.difficulty.trim().length > 0
        ? entry.difficulty
        : 'Aucune difficulte mentionnee.';

      return `
        <article class="item">
          <strong>${student ? student.name : 'Eleve inconnu'} - ${entry.chapter}</strong>
          <div class="item-meta">${course ? course.title : 'Cours inconnu'} - ${date}</div>
          <p><strong>Difficulte remontee:</strong> ${difficultyText}</p>
        </article>
      `;
    })
    .join('');
}

function renderAll() {
  renderStudentSelect();
  renderTeacherSelect();
  renderStudentCourses();
  renderStudentHistory();
  renderTeacherCourses();
  renderTeacherInsights();
}

roleTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    switchRole(tab.dataset.role);
  });
});

studentSelect.addEventListener('change', (event) => {
  state.activeStudentId = event.target.value;
  renderStudentCourses();
  renderStudentHistory();
  studentFeedback.textContent = '';
});

teacherSelect.addEventListener('change', (event) => {
  state.activeTeacherId = event.target.value;
  renderTeacherCourses();
  renderTeacherInsights();
  if (teacherZoomFeedback) {
    teacherZoomFeedback.textContent = '';
  }
});

chapterForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const chapter = chapterTitle.value.trim();
  if (!chapter) {
    studentFeedback.textContent = 'Le chapitre est obligatoire.';
    return;
  }

  const newEntry = {
    id: `p-${Date.now()}`,
    studentId: state.activeStudentId,
    courseId: chapterCourse.value,
    chapter,
    difficulty: chapterDifficulty.value.trim(),
    createdAt: new Date().toISOString(),
  };

  state.data.progress.push(newEntry);
  saveData(state.data);

  chapterForm.reset();
  studentFeedback.textContent = 'Chapitre et difficulte enregistres.';

  renderStudentHistory();
  renderTeacherInsights();
});

teacherCourses.addEventListener('submit', (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || !form.classList.contains('zoom-form')) {
    return;
  }

  event.preventDefault();

  const courseId = form.dataset.courseId;
  const zoomLinkInput = form.querySelector('input[name="zoomLink"]');
  const zoomMeetingIdInput = form.querySelector('input[name="zoomMeetingId"]');
  const zoomPasscodeInput = form.querySelector('input[name="zoomPasscode"]');

  if (
    !courseId ||
    !(zoomLinkInput instanceof HTMLInputElement) ||
    !(zoomMeetingIdInput instanceof HTMLInputElement) ||
    !(zoomPasscodeInput instanceof HTMLInputElement)
  ) {
    return;
  }

  const zoomLink = zoomLinkInput.value.trim();
  const zoomMeetingId = sanitizeMeetingId(zoomMeetingIdInput.value.trim());
  const zoomPasscode = zoomPasscodeInput.value.trim();

  if (!zoomLink && !zoomMeetingId) {
    if (teacherZoomFeedback) {
      teacherZoomFeedback.textContent = 'Ajoutez un lien Zoom personnalise ou un ID de reunion Zoom.';
    }
    return;
  }

  const course = state.data.courses.find((item) => item.id === courseId);
  if (!course) {
    return;
  }

  course.zoomLink = zoomLink;
  course.zoomMeetingId = zoomMeetingId;
  course.zoomPasscode = zoomPasscode;
  saveData(state.data);

  renderStudentCourses();
  renderTeacherCourses();

  if (teacherZoomFeedback) {
    teacherZoomFeedback.textContent = `Configuration Zoom enregistree pour ${course.title}.`;
  }
});

switchRole('student');
renderAll();
