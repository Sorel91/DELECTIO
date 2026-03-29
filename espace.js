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
    },
    {
      id: 'c2',
      title: 'Maths Lycee - Groupe B',
      teacherId: 't1',
      studentIds: ['s2', 's4'],
    },
    {
      id: 'c3',
      title: 'Maths Universite - Groupe C',
      teacherId: 't2',
      studentIds: ['s1', 's4'],
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
    return JSON.parse(raw);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    return structuredClone(defaultData);
  }
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

  studentCourses.innerHTML = courses.map((course) => `<li>${course.title}</li>`).join('');
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

      return `
        <article class="item">
          <strong>${course.title}</strong>
          <p><strong>Eleves inscrits:</strong> ${studentNames || 'Aucun eleve'}</p>
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

switchRole('student');
renderAll();
